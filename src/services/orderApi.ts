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

          // ✅ 1. จัดการออเดอร์ใหม่ (รับ OrderHeader object เดียว)
          const handleNewOrder = (newOrder: OrderHeader) => {
            console.log("🆕 NewOrderReceived:", newOrder.id);
            updateCachedData((draft) => {
              if (!draft.results.find((o) => o.id === newOrder.id)) {
                draft.results.unshift(newOrder);
                draft.totalCount += 1;
              }
            });
          };

          // ✅ 2. จัดการอัปเดตออเดอร์ (รับ OrderHeader object เดียว)
          const handleUpdateOrder = (updatedOrder: OrderHeader) => {
            console.log("🔄 OrderStatusUpdated:", updatedOrder.id, updatedOrder.orderStatus);
            updateCachedData((draft) => {
              const index = draft.results.findIndex((o) => o.id === updatedOrder.id);
              if (index !== -1) {
                draft.results[index] = updatedOrder;
              }
            });
          };

          // ⭐ 3. จัดการอัปเดตสถานะรายจาน (รับ 3 arguments แยกกัน!)
          const handleDetailUpdate = (
            orderId: number,
            detailId: number, 
            kitchenStatus: string
          ) => {
            console.log("🍳 OrderDetailUpdated:", { orderId, detailId, kitchenStatus });
            updateCachedData((draft) => {
              const order = draft.results.find((o) => o.id === orderId);
              if (order) {
                const detail = order.orderDetails.find((d) => d.id === detailId);
                if (detail) {
                  detail.kitchenStatus = kitchenStatus;
                  if (kitchenStatus === "DONE") {
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
          signalRService.on("OrderDetailUpdated", handleDetailUpdate);

          await cacheEntryRemoved;

          // --- Unsubscribe Events ---
          signalRService.off("NewOrderReceived");
          signalRService.off("UpdateEmployeeOrderList");
          signalRService.off("OrderStatusUpdated");
          signalRService.off("OrderDetailUpdated");
        } catch (err) {
          console.error("❌ SignalR Sync Error:", err);
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
      
      // 🔥 Streaming Update Logic (ทำงานตลอดเวลาที่ Component ยังเปิดอยู่)
      async onCacheEntryAdded(
        id,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        try {
          // 1. รอให้ข้อมูลเริ่มต้น (HTTP) โหลดเสร็จก่อน
          await cacheDataLoaded;

          // -----------------------------------------------------------
          // 📡 Handler 1: เมื่อสถานะออเดอร์เปลี่ยน (เช่น "กำลังปรุง" -> "เสร็จแล้ว")
          // -----------------------------------------------------------
          const handleHeaderUpdate = (updatedOrder: OrderHeader) => {
            // เช็คความชัวร์: อัปเดตเฉพาะถ้า ID ตรงกัน
            if (updatedOrder.id !== id) return;

            console.log("🔔 [SignalR] Header Updated:", updatedOrder.orderStatus);

            updateCachedData((draft) => {
              // อัปเดตข้อมูลระดับ Header (Status, Total, PickupCode, etc.)
              draft.orderStatus = updatedOrder.orderStatus;
              draft.pickUpCode = updatedOrder.pickUpCode;
              draft.updatedAt = updatedOrder.updatedAt;
              
              // (Optional) ถ้า Backend ส่งข้อมูลมาทั้งก้อน จะใช้ Object.assign ก็ได้
              // Object.assign(draft, updatedOrder); 
            });
          };

          // -----------------------------------------------------------
          // 📡 Handler 2: เมื่อสถานะรายการย่อยเปลี่ยน (เช่น "ข้าวมันไก่" -> "เสร็จแล้ว")
          // -----------------------------------------------------------
          const handleDetailUpdate = (
            orderId: number,
            detailId: number,
            kitchenStatus: string
          ) => {
            // เช็คความชัวร์: ต้องเป็นออเดอร์นี้เท่านั้น
            if (orderId !== id) return;

            console.log("🔔 [SignalR] Detail Updated:", { detailId, kitchenStatus });

            updateCachedData((draft) => {
              // ค้นหารายการอาหารตัวนั้นใน Array
              const detailItem = draft.orderDetails.find((d) => d.id === detailId);
              
              if (detailItem) {
                // อัปเดตสถานะครัว
                detailItem.kitchenStatus = kitchenStatus;

                // Logic เสริม: ถ้าสถานะเป็น DONE ให้ติ๊ก isReady เป็น true (ถ้ามี field นี้)
                if (kitchenStatus === "DONE" || kitchenStatus === "Ready") {
                  detailItem.isReady = true;
                }
              }
            });
          };

          // -----------------------------------------------------------
          // 🔌 Subscribe: เริ่มดักฟัง Event จาก SignalR
          // -----------------------------------------------------------
          // หมายเหตุ: ชื่อ Event ("OrderStatusUpdated", "OrderDetailUpdated") 
          // ต้องตรงกับที่ Backend C# ส่งมาเป๊ะๆ (Case-sensitive)
          signalRService.on("OrderStatusUpdated", handleHeaderUpdate);
          signalRService.on("OrderDetailUpdated", handleDetailUpdate);

          // -----------------------------------------------------------
          // 🛑 Cleanup: รอจนกว่า user จะปิดหน้าเว็บ หรือเปลี่ยนหน้า
          // -----------------------------------------------------------
          await cacheEntryRemoved;

          // เลิกฟัง Event เพื่อคืน Memory
          signalRService.off("OrderStatusUpdated");
          signalRService.off("OrderDetailUpdated");

        } catch (err) {
          console.error("❌ [SignalR] Error in getOrderById stream:", err);
        }
      },
      
      // Tag สำหรับการ Invalidate ทั่วไป (เช่น กดปุ่มยกเลิกออเดอร์เอง)
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
  useUpdateOrderMutation,
  useUpdateOrderStatusMutation,
  useUpdateKitchenStatusMutation,
  useCancelOrderMutation,
  useGetOrderByPickUpCodeQuery,
  useConfirmPaymentMutation,
  useGetOrderHistoryQuery,
  useDeleteOrderMutation,
} = orderApi;