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

      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        try {
          await cacheDataLoaded;

          // 1. จัดการออเดอร์ใหม่
          const handleNewOrder = (newOrder: OrderHeader) => {
            updateCachedData((draft) => {
              if (!draft.results.find((o) => o.id === newOrder.id)) {
                draft.results.unshift(newOrder);
                draft.totalCount += 1;
              }
            });
          };

          // 2. จัดการอัปเดตออเดอร์ (Header / Status หลัก)
          const handleUpdateOrder = (updatedOrder: OrderHeader) => {
            updateCachedData((draft) => {
              const index = draft.results.findIndex(
                (o) => o.id === updatedOrder.id,
              );
              if (index !== -1) {
                draft.results[index] = updatedOrder;
              }
            });
          };

          // ⭐ 3. (เพิ่มใหม่) จัดการอัปเดตสถานะ "รายจาน" (Kitchen Status)
          const handleDetailUpdate = (payload: {
            orderId: number;
            detailId: number;
            kitchenStatus: string;
          }) => {
            updateCachedData((draft) => {
              // หา Order แม่
              const order = draft.results.find((o) => o.id === payload.orderId);
              if (order) {
                // หาจานลูก
                const detail = order.orderDetails.find(
                  (d) => d.id === payload.detailId,
                );
                if (detail) {
                  // อัปเดตสถานะทันที!
                  detail.kitchenStatus = payload.kitchenStatus;

                  // Optional: ถ้าสถานะเป็น DONE ให้ติ๊ก isReady เป็น true ด้วย (เพื่อให้ UI สีเขียวทำงาน)
                  if (payload.kitchenStatus === "DONE") {
                    detail.isReady = true;
                  }
                }
              }
            });
          };

          // --- Subscribe Events ---
          signalRService.on("NewOrderReceived", handleNewOrder);
          signalRService.on("UpdateEmployeeOrderList", handleUpdateOrder);
          signalRService.on("OrderStatusUpdated", handleUpdateOrder);

          // ✅ อย่าลืมบรรทัดนี้!
          signalRService.on("OrderDetailUpdated", handleDetailUpdate);

          await cacheEntryRemoved;

          // --- Unsubscribe Events ---
          signalRService.off("NewOrderReceived", handleNewOrder);
          signalRService.off("UpdateEmployeeOrderList", handleUpdateOrder);
          signalRService.off("OrderStatusUpdated", handleUpdateOrder);

          // ✅ อย่าลืมเอาออกด้วย!
          signalRService.off("OrderDetailUpdated", handleDetailUpdate);
        } catch (err) {
          console.error("SignalR Sync Error:", err);
        }
      },

      transformResponse: (results: OrderHeader[], meta) => {
        const totalCount = meta?.response?.headers.get("X-Total-Count");
        return {
          results: results ?? [],
          totalCount: totalCount ? parseInt(totalCount) : 0,
        };
      },
      providesTags: ["Order"],
    }),

    // 2. ดึงออเดอร์ตาม ID (สำหรับหน้า Tracking ลูกค้า)
    getOrderById: builder.query<OrderHeader, number>({
      query: (id) => `orders/${id}`,
      
      async onCacheEntryAdded(id, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;

          // 1. ✅ ฟังสถานะออเดอร์หลัก (เช่น Admin กด Ready)
          const handleHeaderUpdate = (updatedOrder: OrderHeader) => {
            // เช็คว่าเป็น ID เดียวกันไหม
            if (updatedOrder.id !== id) return; 

            updateCachedData((draft) => {
                // อัปเดตข้อมูลหลัก
                Object.assign(draft, updatedOrder);
                
                // ถ้า Backend ส่งรายการลูกมาด้วย ให้ทับไปเลยเพื่อความชัวร์ (กรณี Admin แก้ไขเมนู)
                if (updatedOrder.orderDetails && updatedOrder.orderDetails.length > 0) {
                    draft.orderDetails = updatedOrder.orderDetails;
                }
            });
          };

          // 2. ⭐ ฟังสถานะรายจาน (เช่น ครัวกด DONE) [จุดที่เพิ่มมา]
          const handleDetailUpdate = (payload: { orderId: number; detailId: number; kitchenStatus: string }) => {
             if (payload.orderId !== id) return;

             updateCachedData((draft) => {
                // หาจานนั้นใน Cache แล้วเปลี่ยนสถานะ
                const detail = draft.orderDetails.find(d => d.id === payload.detailId);
                if (detail) {
                   detail.kitchenStatus = payload.kitchenStatus;
                   
                   // อัปเดต isReady เพื่อให้ Frontend แสดงผลถูกต้อง (ถ้าจำเป็น)
                   if (payload.kitchenStatus === 'DONE') {
                       detail.isReady = true;
                   }
                }
             });
          };

          // --- Subscribe (เปิดการรับฟัง) ---
          signalRService.on("OrderStatusUpdated", handleHeaderUpdate);
          signalRService.on("OrderDetailUpdated", handleDetailUpdate); // ✅ เพิ่มบรรทัดนี้

          await cacheEntryRemoved;
          
          // --- Unsubscribe (ปิดการรับฟังเมื่อออกจากหน้า) ---
          signalRService.off("OrderStatusUpdated", handleHeaderUpdate);
          signalRService.off("OrderDetailUpdated", handleDetailUpdate); // ✅ เพิ่มบรรทัดนี้

        } catch (err) {
            console.error("SignalR Tracking Error:", err);
        }
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
    updateOrderStatus: builder.mutation<OrderHeader,{ id: number; newStatus: string }>({
      query: ({ id, newStatus }) => ({
        url: `orders/${id}/status`,
        method: "PUT",
        body: JSON.stringify(newStatus),
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: "Order", id }, "Order"],
    }),

    // 6. อัปเดตสถานะครัวรายรายการ (KDS)
    updateKitchenStatus: builder.mutation<void,{ detailId: number; status: string }>({
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
    confirmPayment: builder.mutation<OrderHeader,{ id: number; paymentMethod: string }>({
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