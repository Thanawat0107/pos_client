/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrlAPI, Sd } from "../helpers/SD";
import type { OrderHeader } from "../@types/dto/OrderHeader";
import type { OrdersQuery } from "../@types/requests/OrdersQuery";
import { signalRService } from "./signalrService";
import type { CreateOrder } from "../@types/createDto/CreateOrder";
import type { UpdateOrder } from "../@types/UpdateDto/UpdateOrder";
import type { CancelRequest } from "../@types/requests/CancelRequest";

export const orderApi = createApi({
  reducerPath: "Order",
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlAPI }),
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    // -------------------------------------------------------------------------
    // 1. Get All Orders (Admin/Staff) + Real-time Sync
    // -------------------------------------------------------------------------
    getOrderAll: builder.query<
      { results: OrderHeader[]; totalCount: number },
      OrdersQuery
    >({
      query: (params) => ({ url: "orders", params }),

      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        try {
          await cacheDataLoaded;
          await signalRService.startConnection();
          console.log("🔌 [Admin] SignalR Re-Connected (With Admin Token)");

          // --- Define Handlers ---
          const handleNewOrder = (newOrder: OrderHeader) => {
            console.log("🆕 NewOrderReceived:", newOrder.id);
            updateCachedData((draft) => {
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
              const index = draft.results.findIndex(
                (o) => o.id === updatedOrder.id,
              );
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
                const detail = order.orderDetails.find(
                  (d) => d.id === detailId,
                );
                if (detail) {
                  detail.kitchenStatus = kitchenStatus;
                  if (kitchenStatus === Sd.KDS_Done) detail.isReady = true;
                  if (kitchenStatus === Sd.KDS_Cancelled)
                    detail.isCancelled = true;
                }
              }
            });
          };

          const handleDeleteOrder = (deletedId: number) => {
            console.log("🗑️ OrderDeleted:", deletedId);
            updateCachedData((draft) => {
              if (!draft.results) return;
              const initialLength = draft.results.length;
              draft.results = draft.results.filter((o) => o.id !== deletedId);
              if (draft.results.length < initialLength) {
                draft.totalCount = Math.max(0, draft.totalCount - 1);
              }
            });
          };

          // --- Subscribe Events ---
          signalRService.on("NewOrderReceived", handleNewOrder);
          signalRService.on("OrderUpdated", handleUpdateOrder);
          signalRService.on("OrderDetailUpdated", handleDetailUpdate);
          signalRService.on("OrderDeleted", handleDeleteOrder);
          // ✅ ADDED: Listen for employee updates
          signalRService.on("UpdateEmployeeOrderList", handleUpdateOrder);

          // --- Cleanup ---
          await cacheEntryRemoved;

          // ✅ FIXED: Pass callbacks to .off() to remove only these listeners
          signalRService.off("NewOrderReceived", handleNewOrder);
          signalRService.off("OrderUpdated", handleUpdateOrder);
          signalRService.off("OrderDetailUpdated", handleDetailUpdate);
          signalRService.off("OrderDeleted", handleDeleteOrder);
          signalRService.off("UpdateEmployeeOrderList", handleUpdateOrder);
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
    // 2. Get Order by ID (Customer Tracking / Admin Detail)
    // -------------------------------------------------------------------------
    getOrderById: builder.query<
      OrderHeader,
      { id: number; guestToken?: string }
    >({
      query: ({ id, guestToken }) => ({
        url: `orders/${id}`,
        headers: guestToken
          ? { Authorization: `Bearer ${guestToken}` }
          : undefined,
      }),

      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        const orderId = arg.id;

        try {
          await cacheDataLoaded;
          await signalRService.startConnection();
          await signalRService.invoke("JoinOrderGroup", orderId.toString());
          console.log(`🔌 [Tracking] Joined Group Order: ${orderId}`);

          // --- Define Handlers ---
          const handleHeaderUpdate = (updatedOrder: OrderHeader) => {
            if (updatedOrder.id !== orderId) return;
            updateCachedData((draft) => {
              Object.assign(draft, updatedOrder);
              const isFinished = [
                Sd.Status_Ready,
                Sd.Status_Completed,
              ].includes(updatedOrder.orderStatus);

              if (isFinished && draft.orderDetails) {
                draft.orderDetails.forEach((item) => {
                  if (!item.isCancelled) {
                    item.kitchenStatus = Sd.KDS_Done;
                    item.isReady = true;
                  }
                });
              }

              if (
                updatedOrder.orderDetails &&
                updatedOrder.orderDetails.length > 0
              ) {
                draft.orderDetails = updatedOrder.orderDetails;
              }
            });
          };

          const handleDetailUpdate = (payload: any) => {
            const { orderId: updatedId, detailId, kitchenStatus } = payload;
            if (updatedId !== orderId) return;
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
          signalRService.on("OrderDetailUpdated", handleDetailUpdate);
          // ✅ ADDED: Listen for employee updates
          signalRService.on("UpdateEmployeeOrderList", handleHeaderUpdate);

          // --- Cleanup ---
          await cacheEntryRemoved;

          // ✅ FIXED: Pass callbacks
          signalRService.off("OrderStatusUpdated", handleHeaderUpdate);
          signalRService.off("OrderDetailUpdated", handleDetailUpdate);
          signalRService.off("UpdateEmployeeOrderList", handleHeaderUpdate);
        } catch (err) {
          console.error("❌ SignalR Sync Error (Detail):", err);
        }
      },
      providesTags: (_result, _error, arg) => [{ type: "Order", id: arg.id }],
    }),

    // -------------------------------------------------------------------------
    // 3. Get Order History (Member)
    // -------------------------------------------------------------------------
    getOrderHistory: builder.query<
      OrderHeader[],
      { userId?: string; guestToken?: string }
    >({
      query: (params) => ({
        url: "orders/history",
        params,
      }),

      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        try {
          await cacheDataLoaded;
          await signalRService.startConnection();

          // 1. ถ้าเป็น User (ง่าย)
          if (arg.userId) {
            const userRoom = `User_${arg.userId}`;
            await signalRService.invoke("JoinUserGroup", userRoom);
            console.log(`🔌 [History] Joined: ${userRoom}`);
          }
          // 2. ถ้าเป็น Guest (ต้องแยก Token)
          else if (arg.guestToken) {
            // แยก string ด้วย comma (,)
            const tokens = arg.guestToken.split(",");

            // วนลูป Join ทุกห้อง
            for (const t of tokens) {
              const cleanToken = t.trim(); // กันเหนียวเผื่อมีเว้นวรรค
              if (cleanToken) {
                const guestRoom = `Guest_${cleanToken}`;
                await signalRService.invoke("JoinUserGroup", guestRoom);
                console.log(`🔌 [History] Joined: ${guestRoom}`);
              }
            }
          }

          // --- Define Handler ---
          const handleUpdateList = (updatedOrder: OrderHeader) => {
            updateCachedData((draft) => {
              const index = draft.findIndex((o) => o.id === updatedOrder.id);
              if (index !== -1) {
                draft[index] = updatedOrder;
              } else {
                draft.unshift(updatedOrder);
              }
            });
          };

          // --- Subscribe Events ---
          signalRService.on("OrderStatusUpdated", handleUpdateList);
          signalRService.on("NewOrderReceived", handleUpdateList);
          // ✅ ADDED: Listen for employee updates
          signalRService.on("UpdateEmployeeOrderList", handleUpdateList);

          // --- Cleanup ---
          await cacheEntryRemoved;

          // ✅ FIXED: Pass callbacks
          signalRService.off("OrderStatusUpdated", handleUpdateList);
          signalRService.off("NewOrderReceived", handleUpdateList);
          signalRService.off("UpdateEmployeeOrderList", handleUpdateList);
        } catch (err) {
          console.error("❌ SignalR History Error:", err);
        }
      },
      providesTags: ["Order"],
    }),

    // ... (rest of mutations remain unchanged) ...
    confirmCart: builder.mutation<OrderHeader, CreateOrder>({
      query: (body) => ({ url: "orders/confirm-cart", method: "POST", body }),
      invalidatesTags: ["Order"],
    }),

    updateOrder: builder.mutation<OrderHeader, UpdateOrder>({
      query: (body) => ({ url: "orders", method: "PUT", body }),
    }),

    updateOrderStatus: builder.mutation<
      OrderHeader,
      { id: number; newStatus: string }
    >({
      query: ({ id, newStatus }) => ({
        url: `orders/${id}/status`,
        method: "PUT",
        body: JSON.stringify(newStatus),
        headers: { "Content-Type": "application/json" },
      }),
    }),

    updateKitchenStatus: builder.mutation<
      void,
      { detailId: number; status: string }
    >({
      query: ({ detailId, status }) => ({
        url: `orders/details/${detailId}/status`,
        method: "PATCH",
        body: JSON.stringify(status),
        headers: { "Content-Type": "application/json" },
      }),
    }),

    cancelOrder: builder.mutation<
      { message: string },
      { id: number; request: CancelRequest }
    >({
      query: ({ id, request }) => ({
        url: `orders/${id}/cancel`,
        method: "POST",
        body: request,
      }),
    }),

    getOrderByPickUpCode: builder.query<OrderHeader, string>({
      query: (code) => `orders/pickup/${code}`,
      providesTags: (_result, _error, code) => [{ type: "Order", id: code }],
    }),

    confirmPayment: builder.mutation<
      OrderHeader,
      { id: number; paymentMethod: string }
    >({
      query: ({ id, paymentMethod }) => ({
        url: `orders/${id}/confirm-payment`,
        method: "POST",
        body: JSON.stringify(paymentMethod), // ส่งไปเป็น "cash" หรือ "promptPay"
        headers: { "Content-Type": "application/json" },
      }),
      // ✅ เพิ่มตรงนี้: เพื่อบังคับโหลดข้อมูลออเดอร์นี้ใหม่ทันทีที่กดสำเร็จ (กันเหนียว)
      invalidatesTags: (result, error, arg) => [
        { type: "Order", id: arg.id }, // รีเฟรชเฉพาะออเดอร์นี้ (หน้า Detail)
        { type: "Order", id: "LIST" }, // (Optional) ถ้ารายการหน้า List ไม่ขยับ ให้ใส่ id: "LIST" เพิ่ม
      ],
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