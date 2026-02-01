/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrlAPI, Sd } from "../helpers/SD"; // ✅ Import Sd
import type { OrderHeader } from "../@types/dto/OrderHeader";
import type { OrdersQuery } from "../@types/requests/OrdersQuery";
import { signalRService } from "./signalrService";
import type { CreateOrder } from "../@types/createDto/CreateOrder";
import type { UpdateOrder } from "../@types/UpdateDto/UpdateOrder";
import type { CancelRequest } from "../@types/requests/cancelRequest";

export const orderApi = createApi({
  reducerPath: "Order",
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlAPI }),
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    
   // -------------------------------------------------------------------------
    // 1. ดึงออเดอร์ทั้งหมด (Admin/Staff) + Real-time Sync
    // -------------------------------------------------------------------------
    getOrderAll: builder.query<{ results: OrderHeader[]; totalCount: number }, OrdersQuery>({
      query: (params) => ({ url: "orders", params }),

      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        try {
          await cacheDataLoaded;

          // 🔥 [แก้ตรงนี้] บังคับตัดการเชื่อมต่อเก่าทิ้งก่อน (เผื่อเป็น Guest Connection)
          // แล้วต่อใหม่ เพื่อให้ส่ง Token Admin ไปหา Backend
          await signalRService.stopConnection(); 
          await signalRService.startConnection();
          
          console.log("🔌 [Admin] SignalR Re-Connected (With Admin Token)");

          // --- Define Handlers ---

          const handleNewOrder = (newOrder: OrderHeader) => {
            console.log("🆕 NewOrderReceived:", newOrder.id);
            updateCachedData((draft) => {
              // เช็คกันเหนียวว่ามี array ไหม
              if (!draft.results) draft.results = [];
              
              if (!draft.results.find((o) => o.id === newOrder.id)) {
                draft.results.unshift(newOrder);
                draft.totalCount += 1;
              }
            });
          };

          const handleUpdateOrder = (updatedOrder: OrderHeader) => {
            console.log("🔄 Order Updated:", updatedOrder.id);
            updateCachedData((draft) => {
              if (!draft.results) return;
              const index = draft.results.findIndex((o) => o.id === updatedOrder.id);
              if (index !== -1) {
                draft.results[index] = updatedOrder;
              }
            });
          };

          const handleDetailUpdate = (payload: any) => {
            const { orderId, detailId, kitchenStatus } = payload;
            updateCachedData((draft) => {
              if (!draft.results) return;
              const order = draft.results.find((o) => o.id === orderId);
              if (order) {
                const detail = order.orderDetails.find((d) => d.id === detailId);
                if (detail) {
                  detail.kitchenStatus = kitchenStatus;
                  if (kitchenStatus === Sd.KDS_Done) detail.isReady = true;
                  if (kitchenStatus === Sd.KDS_Cancelled) detail.isCancelled = true;
                }
              }
            });
          };

          const handleDeleteOrder = (deletedId: number) => {
             console.log("🗑️ OrderDeleted:", deletedId);
             updateCachedData((draft) => {
                if (!draft.results) return;
                const initialLength = draft.results.length;
                draft.results = draft.results.filter(o => o.id !== deletedId);
                // ถ้าลบจริง ให้ลด count ลง
                if (draft.results.length < initialLength) {
                    draft.totalCount = Math.max(0, draft.totalCount - 1);
                }
             });
          };

          // --- Subscribe Events ---
          signalRService.on("NewOrderReceived", handleNewOrder);
          signalRService.on("UpdateEmployeeOrderList", handleUpdateOrder);
          signalRService.on("OrderStatusUpdated", handleUpdateOrder);
          signalRService.on("OrderDetailUpdated", handleDetailUpdate);
          signalRService.on("OrderDeleted", handleDeleteOrder);

          // --- Cleanup ---
          await cacheEntryRemoved;

          signalRService.off("NewOrderReceived");
          signalRService.off("UpdateEmployeeOrderList");
          signalRService.off("OrderStatusUpdated");
          signalRService.off("OrderDetailUpdated");
          signalRService.off("OrderDeleted");

        } catch (err) {
          console.error("❌ SignalR Sync Error (Admin):", err);
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

    // -------------------------------------------------------------------------
    // 2. ดึงออเดอร์ตาม ID (Customer Tracking / Admin Detail)
    // -------------------------------------------------------------------------
    getOrderById: builder.query<OrderHeader, number>({
      query: (id) => `orders/${id}`,
      async onCacheEntryAdded(
        id,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        try {
          await cacheDataLoaded;

          // ✅ Tracking ไม่จำเป็นต้อง Force Reconnect (เพราะใช้ Anonymous ได้)
          // แค่เช็คว่าต่อหรือยัง ถ้ายังก็ต่อ
          await signalRService.startConnection();
          await signalRService.invoke("JoinOrderGroup", id.toString());
          console.log(`🔌 [Tracking] Joined Group Order: ${id}`);

          // --- Define Handlers ---

          const handleHeaderUpdate = (updatedOrder: OrderHeader) => {
            if (updatedOrder.id !== id) return;
            updateCachedData((draft) => {
              Object.assign(draft, updatedOrder);

              const isFinished = [Sd.Status_Ready, Sd.Status_Completed].includes(updatedOrder.orderStatus);
              
              if (isFinished && draft.orderDetails) {
                draft.orderDetails.forEach((item) => {
                  if (!item.isCancelled) {
                    item.kitchenStatus = Sd.KDS_Done;
                    item.isReady = true;
                  }
                });
              }
              
              if (updatedOrder.orderDetails && updatedOrder.orderDetails.length > 0) {
                  draft.orderDetails = updatedOrder.orderDetails;
              }
            });
          };

          const handleDetailUpdate = (payload: any) => {
            const { orderId, detailId, kitchenStatus } = payload;
            if (orderId !== id) return;

            updateCachedData((draft) => {
              const item = draft.orderDetails.find((d) => d.id === detailId);
              if (item) {
                item.kitchenStatus = kitchenStatus;
                if (kitchenStatus === Sd.KDS_Cancelled) item.isCancelled = true;
                if (kitchenStatus === Sd.KDS_Done) item.isReady = true;
              }
            });
          };

          // --- Subscribe Events ---
          signalRService.on("OrderStatusUpdated", handleHeaderUpdate);
          signalRService.on("UpdateEmployeeOrderList", handleHeaderUpdate); 
          signalRService.on("OrderDetailUpdated", handleDetailUpdate);

          // --- Cleanup ---
          await cacheEntryRemoved;

          signalRService.off("OrderStatusUpdated");
          signalRService.off("UpdateEmployeeOrderList");
          signalRService.off("OrderDetailUpdated");

        } catch (err) {
          console.error("❌ SignalR Sync Error (Detail):", err);
        }
      },
      providesTags: (_result, _error, id) => [{ type: "Order", id }],
    }),

// ⭐ 1. ปรับปรุง getOrderHistory ให้เป็น Real-time
    getOrderHistory: builder.query<OrderHeader[],{ userId?: string; guestToken?: string }>({
      query: (params) => ({
        url: "orders/history",
        params,
      }),
      
      // ✅ เพิ่ม Logic Real-time ตรงนี้
      async onCacheEntryAdded(
        arg, // arg คือ { userId, guestToken } ที่ส่งเข้ามา
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        try {
          await cacheDataLoaded;

          // 1. สร้างชื่อห้อง (ให้ตรงกับ Backend logic)
          const userRoom = arg.userId ? `User_${arg.userId}` : `Guest_${arg.guestToken}`;

          // 2. ต่อ SignalR และเข้าห้องส่วนตัว
          await signalRService.startConnection();
          await signalRService.invoke("JoinUserGroup", userRoom); 
          console.log(`🔌 [History] Joined User Room: ${userRoom}`);

          // 3. ฟังก์ชันอัปเดต List
          const handleUpdateList = (updatedOrder: OrderHeader) => {
             updateCachedData((draft) => {
                // หาว่ามีออเดอร์นี้ใน list ไหม
                const index = draft.findIndex(o => o.id === updatedOrder.id);
                
                if (index !== -1) {
                   // ถ้ามี -> อัปเดตข้อมูล
                   draft[index] = updatedOrder;
                } else {
                   // ถ้าไม่มี (ออเดอร์ใหม่) -> เพิ่มเข้าไปบนสุด
                   draft.unshift(updatedOrder);
                }
             });
          };

          // 4. Subscribe Events
          // (Backend ส่งมาที่ห้อง UserRoom เราก็จะได้ยินด้วย)
          signalRService.on("OrderStatusUpdated", handleUpdateList);
          signalRService.on("NewOrderReceived", handleUpdateList); // เผื่อลูกค้าเปิด 2 จอ จอหนึ่งสั่ง จอนี้ต้องเด้ง

          await cacheEntryRemoved;

          // Cleanup
          signalRService.off("OrderStatusUpdated");
          signalRService.off("NewOrderReceived");

        } catch (err) {
          console.error("❌ SignalR History Error:", err);
        }
      },
      providesTags: ["Order"],
    }),

    confirmCart: builder.mutation<OrderHeader, CreateOrder>({
      query: (body) => ({ url: "orders/confirm-cart", method: "POST", body }),
      invalidatesTags: ["Order"],
    }),

    updateOrder: builder.mutation<OrderHeader, UpdateOrder>({
      query: (body) => ({ url: "orders", method: "PUT", body }),
    }),

    updateOrderStatus: builder.mutation<OrderHeader, { id: number; newStatus: string }>({
      query: ({ id, newStatus }) => ({
        url: `orders/${id}/status`,
        method: "PUT",
        body: JSON.stringify(newStatus),
        headers: { "Content-Type": "application/json" },
      }),
    }),

    updateKitchenStatus: builder.mutation<void, { detailId: number; status: string }>({
      query: ({ detailId, status }) => ({
        url: `orders/details/${detailId}/status`,
        method: "PATCH",
        body: JSON.stringify(status),
        headers: { "Content-Type": "application/json" },
      }),
    }),

    cancelOrder: builder.mutation<{ message: string }, { id: number; request: CancelRequest }>({
      query: ({ id, request }) => ({ url: `orders/${id}/cancel`, method: "POST", body: request }),
    }),

    getOrderByPickUpCode: builder.query<OrderHeader, string>({
      query: (code) => `orders/pickup/${code}`,
      providesTags: (_result, _error, code) => [{ type: "Order", id: code }],
    }),

    confirmPayment: builder.mutation<OrderHeader, { id: number; paymentMethod: string }>({
      query: ({ id, paymentMethod }) => ({
        url: `orders/${id}/confirm-payment`,
        method: "POST",
        body: JSON.stringify(paymentMethod),
        headers: { "Content-Type": "application/json" },
      }),
    }),

    deleteOrder: builder.mutation<void, number>({
      query: (id) => ({ url: `orders/${id}`, method: "DELETE" }),
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