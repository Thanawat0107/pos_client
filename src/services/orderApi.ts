/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrlAPI } from "../helpers/SD";
import type { OrderHeader } from "../@types/dto/OrderHeader";
import type { OrdersQuery } from "../@types/requests/OrdersQuery";
import { signalRService } from "./signalrService";
import type { CreateOrder } from "../@types/createDto/CreateOrder";
import type { UpdateOrder } from "../@types/UpdateDto/UpdateOrder";

export const orderApi = createApi({
  reducerPath: "Order",
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlAPI }),
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    
    // 1. สำหรับ Admin/Staff: ดึงออเดอร์ทั้งหมด พร้อม Real-time Sync
    getOrderAll: builder.query<{ results: OrderHeader[]; totalCount: number }, OrdersQuery>({
      query: (params) => ({ url: "orders", params }),
      
      async onCacheEntryAdded(_arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;

          const handleNewOrder = (newOrder: OrderHeader) => {
            updateCachedData((draft) => {
              if (!draft.results.find(o => o.id === newOrder.id)) {
                draft.results.unshift(newOrder);
                draft.totalCount += 1;
              }
            });
          };

          const handleUpdateOrder = (updatedOrder: OrderHeader) => {
            updateCachedData((draft) => {
              const index = draft.results.findIndex(o => o.id === updatedOrder.id);
              if (index !== -1) {
                draft.results[index] = updatedOrder;
              }
            });
          };

          signalRService.on("NewOrderReceived", handleNewOrder);
          signalRService.on("UpdateEmployeeOrderList", handleUpdateOrder);
          signalRService.on("OrderStatusUpdated", handleUpdateOrder);

          await cacheEntryRemoved;
          
          signalRService.off("NewOrderReceived", handleNewOrder);
          signalRService.off("UpdateEmployeeOrderList", handleUpdateOrder);
          signalRService.off("OrderStatusUpdated", handleUpdateOrder);

        } catch (err) {
          console.error("SignalR Sync Error:", err);
        }
      },
      
      transformResponse: (results: OrderHeader[], meta) => {
        const totalCount = meta?.response?.headers.get("X-Total-Count");
        return { 
          results: results ?? [], 
          totalCount: totalCount ? parseInt(totalCount) : 0 
        };
      },
      providesTags: ["Order"],
    }),

    // 2. ดึงออเดอร์ตาม ID
    getOrderById: builder.query<OrderHeader, number>({
      query: (id) => `orders/${id}`,
      async onCacheEntryAdded(id, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;
          const handleUpdate = (updatedOrder: OrderHeader) => {
            updateCachedData((draft) => {
              if (updatedOrder.id === id) {
                Object.assign(draft, updatedOrder);
              }
            });
          };
          signalRService.on("OrderStatusUpdated", handleUpdate);
          await cacheEntryRemoved;
          signalRService.off("OrderStatusUpdated", handleUpdate);
        } catch {}
      },
      providesTags: (_result, _error, id) => [{ type: "Order", id }],
    }),

    // ⭐ 1. เพิ่ม Get History (สำหรับลูกค้าดูประวัติ)
    getOrderHistory: builder.query<OrderHeader[], { userId?: string; guestToken?: string }>({
      query: (params) => ({
        url: "orders/history",
        params, // ส่ง userId หรือ guestToken ไปเป็น Query String
      }),
      providesTags: ["Order"],
    }),

    // 3. กดยืนยันออเดอร์จากตะกร้า (Customer)
    confirmCart: builder.mutation<OrderHeader, CreateOrder>({
      query: (body) => ({
        url: "orders/confirm-cart",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order"],
    }),

    // ⭐ 4. แก้ไขข้อมูลออเดอร์โดย Admin (ชื่อ, เบอร์, ส่วนลด)
    updateOrder: builder.mutation<OrderHeader, UpdateOrder>({
      query: (body) => ({
        url: "orders",
        method: "PUT",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: "Order", id }, "Order"],
    }),

    // 5. อัปเดตสถานะออเดอร์ Workflow (Admin/Staff)
    updateOrderStatus: builder.mutation<OrderHeader, { id: number; newStatus: string }>({
      query: ({ id, newStatus }) => ({
        url: `orders/${id}/status`,
        method: "PUT",
        body: JSON.stringify(newStatus), 
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: "Order", id }, "Order"],
    }),

    // 6. อัปเดตสถานะครัวรายรายการ (KDS)
    updateKitchenStatus: builder.mutation<void, { detailId: number; status: string }>({
      query: ({ detailId, status }) => ({
        url: `orders/details/${detailId}/status`,
        method: "PATCH",
        body: JSON.stringify(status), // Backend รับ [FromBody] string status
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["Order"],
    }),

    // 7. ยกเลิกออเดอร์
    cancelOrder: builder.mutation<any, { id: number; request: any }>({
      query: ({ id, request }) => ({
        url: `orders/${id}/cancel`,
        method: "POST",
        body: request,
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: "Order", id }, "Order"],
    }),

    // 8. ค้นหาด้วยรหัส PickUp สำหรับพนักงานหน้าเคาน์เตอร์
    getOrderByPickUpCode: builder.query<OrderHeader, string>({
      query: (code) => `orders/pickup/${code}`,
      providesTags: (_result, _error, code) => [{ type: "Order", id: code }],
    }),

    // ⭐ 9. ยืนยันการชำระเงิน
    confirmPayment: builder.mutation<OrderHeader, { id: number; paymentMethod: string }>({
      query: ({ id, paymentMethod }) => ({
        url: `orders/${id}/confirm-payment`,
        method: "POST",
        body: JSON.stringify(paymentMethod),
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: "Order", id }, "Order"],
    }),

    // ⭐ 2. เพิ่ม Delete Order (สำหรับ Admin ลบออเดอร์)
    deleteOrder: builder.mutation<void, number>({
      query: (id) => ({
        url: `orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});

export const {
  useGetOrderAllQuery,
  useGetOrderByIdQuery,
  useConfirmCartMutation,
  useUpdateOrderMutation, // เพิ่มตัวนี้
  useUpdateOrderStatusMutation,
  useUpdateKitchenStatusMutation,
  useCancelOrderMutation,
  useGetOrderByPickUpCodeQuery,
  useConfirmPaymentMutation, // เพิ่มตัวนี้
  useGetOrderHistoryQuery, // เพิ่มตัวนี้
  useDeleteOrderMutation, // เพิ่มตัวนี้
} = orderApi;