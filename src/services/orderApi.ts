/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrlAPI } from "../helpers/SD";
import type { OrderHeader } from "../@types/dto/OrderHeader";
import type { OrdersQuery } from "../@types/requests/OrdersQuery";
import type { ConfirmCartRequest } from "../@types/createDto/ConfirmCartRequest";
import { signalRService } from "./signalrService";

export const orderApi = createApi({
  reducerPath: "Order",
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlAPI }),
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    
    // 1. สำหรับ Admin/Staff: ดึงออเดอร์ทั้งหมด พร้อม Real-time Sync
    getOrderAll: builder.query<{ results: OrderHeader[]; totalCount: number }, OrdersQuery>({
      query: (params) => ({ url: "orders", params }),
      
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          // รอจนกว่าข้อมูลจาก API รอบแรกจะโหลดเข้า Cache สำเร็จ
          await cacheDataLoaded;

          // ฟังก์ชันสำหรับรับออเดอร์ใหม่ (เด้งขึ้นหน้าสุด)
          const handleNewOrder = (newOrder: OrderHeader) => {
            updateCachedData((draft) => {
              // ตรวจสอบเบื้องต้นว่ามีออเดอร์นี้อยู่ใน list หรือยัง (ป้องกัน duplicate)
              if (!draft.results.find(o => o.id === newOrder.id)) {
                draft.results.unshift(newOrder);
                draft.totalCount += 1;
              }
            });
          };

          // ฟังก์ชันสำหรับอัปเดตสถานะออเดอร์ที่มีอยู่แล้ว
          const handleUpdateOrder = (updatedOrder: OrderHeader) => {
            updateCachedData((draft) => {
              const index = draft.results.findIndex(o => o.id === updatedOrder.id);
              if (index !== -1) {
                draft.results[index] = updatedOrder;
              }
            });
          };

          // เริ่มดักฟัง Event จาก SignalR ผ่าน Singleton Service ของคุณ
          signalRService.on("NewOrderReceived", handleNewOrder);
          signalRService.on("UpdateEmployeeOrderList", handleUpdateOrder);
          signalRService.on("OrderStatusUpdated", handleUpdateOrder);

          // เมื่อ Component ที่ใช้ Hook นี้ถูก Unmount (ปิดหน้าจอ)
          await cacheEntryRemoved;
          
          // ยกเลิกการดักฟัง เพื่อไม่ให้เกิด Memory Leak
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
      // ใช้ฟังก์ชันเดียวกันเพื่ออัปเดตข้อมูล Real-time ในหน้า Detail
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
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),

    // 3. กดยืนยันออเดอร์จากตะกร้า
    confirmCart: builder.mutation<OrderHeader, ConfirmCartRequest>({
      query: (body) => ({
        url: "orders/confirm-cart",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order"],
    }),

    // 4. อัปเดตสถานะออเดอร์ (Admin/Staff)
    updateOrderStatus: builder.mutation<OrderHeader, { id: number; newStatus: string }>({
      query: ({ id, newStatus }) => ({
        url: `orders/${id}/status`,
        method: "PUT",
        body: JSON.stringify(newStatus), 
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: (res, err, { id }) => [{ type: "Order", id }, "Order"],
    }),

    // 5. อัปเดตสถานะครัวรายรายการ (KDS)
    updateKitchenStatus: builder.mutation<void, { detailId: number; status: string }>({
      query: ({ detailId, status }) => ({
        url: `orders/details/${detailId}/status`,
        method: "PATCH",
        body: JSON.stringify(status),
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["Order"],
    }),

    // 6. ยกเลิกออเดอร์
    cancelOrder: builder.mutation<any, { id: number; request: any }>({
      query: ({ id, request }) => ({
        url: `orders/${id}/cancel`,
        method: "POST",
        body: request,
      }),
      invalidatesTags: (res, err, { id }) => [{ type: "Order", id }, "Order"],
    }),

    // 7. ค้นหาด้วยรหัส PickUp สำหรับพนักงานหน้าเคาน์เตอร์
    getOrderByPickUpCode: builder.query<OrderHeader, string>({
      query: (code) => `orders/pickup/${code}`,
    }),
  }),
});

export const {
  useGetOrderAllQuery,
  useGetOrderByIdQuery,
  useConfirmCartMutation,
  useUpdateOrderStatusMutation,
  useUpdateKitchenStatusMutation,
  useCancelOrderMutation,
  useGetOrderByPickUpCodeQuery,
} = orderApi;