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
    getOrderAll: builder.query<
      { results: OrderHeader[]; totalCount: number },
      OrdersQuery
    >({
      query: (params) => ({ url: "orders", params }),
      transformResponse: (response: OrderHeader[], meta) => {
        return {
          results: response,
          totalCount: Number(meta?.response?.headers.get("X-Total-Count")) || 0,
        };
      },
      providesTags: (result) =>
        result?.results
          ? [
              ...result.results.map(({ id }) => ({
                type: "Order" as const,
                id,
              })),
              { type: "Order", id: "LIST" },
            ]
          : [{ type: "Order", id: "LIST" }],

      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        try {
          await cacheDataLoaded;
          await signalRService.startConnection();

          // Handler สำหรับคำสั่งซื้อใหม่
          const handleNewOrder = (newOrder: OrderHeader) => {
            updateCachedData((draft) => {
              if (!draft.results) draft.results = [];
              if (!draft.results.find((o) => o.id === newOrder.id)) {
                draft.results.unshift(newOrder);
                draft.totalCount += 1;
              }
            });
          };

          // Handler สำหรับอัปเดตสถานะออเดอร์หลัก
          const handleUpdateOrder = (updatedOrder: OrderHeader) => {
            updateCachedData((draft) => {
              if (!draft.results) return;
              const index = draft.results.findIndex(
                (o) => o.id === updatedOrder.id,
              );
              if (index !== -1) draft.results[index] = updatedOrder;
            });
          };

          // 🚩 [จุดสำคัญที่เพิ่ม] Handler สำหรับอัปเดตรายจาน (Granular Update)
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
                  // ✅ อัปเดตสถานะ Boolean เพื่อให้ UI (เช่น ขีดฆ่า หรือ ปุ่มยกเลิก) เปลี่ยนทันที
                  detail.isReady = kitchenStatus === Sd.KDS_Done;
                  detail.isCancelled = kitchenStatus === Sd.KDS_Cancelled;
                }
              }
            });
          };

          signalRService.on("NewOrderReceived", handleNewOrder);
          signalRService.on("OrderUpdated", handleUpdateOrder);
          signalRService.on("OrderDetailUpdated", handleDetailUpdate);
          signalRService.on("UpdateEmployeeOrderList", handleUpdateOrder);

          await cacheEntryRemoved;
          signalRService.off("NewOrderReceived", handleNewOrder);
          signalRService.off("OrderUpdated", handleUpdateOrder);
          signalRService.off("OrderDetailUpdated", handleDetailUpdate);
          signalRService.off("UpdateEmployeeOrderList", handleUpdateOrder);
        } catch (err) {
          console.error("SignalR Admin Error:", err);
        }
      },
    }),

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
      providesTags: (_result, _error, arg) => [{ type: "Order", id: arg.id }],
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        try {
          await cacheDataLoaded;
          await signalRService.startConnection();
          await signalRService.invoke("JoinOrderGroup", arg.id.toString());

          // Handler สำหรับ Header (สถานะแม่)
          const handleUpdate = (updatedOrder: OrderHeader) => {
            if (updatedOrder.id !== arg.id) return;
            updateCachedData((draft) => {
              Object.assign(draft, updatedOrder);
            });
          };

          // 🚩 [จุดสำคัญที่เพิ่ม] Handler สำหรับรายจาน (เพื่อให้ลูกค้าเห็นจานอาหารเปลี่ยนสีทันที)
          const handleDetailUpdate = (payload: any) => {
            const { orderId: updatedId, detailId, kitchenStatus } = payload;
            if (updatedId !== arg.id) return;
            updateCachedData((draft) => {
              const item = draft.orderDetails.find((d) => d.id === detailId);
              if (item) {
                item.kitchenStatus = kitchenStatus;
                // ✅ อัปเดตสถานะ Boolean ทันที
                item.isReady = kitchenStatus === Sd.KDS_Done;
                item.isCancelled = kitchenStatus === Sd.KDS_Cancelled;
              }
            });
          };

          signalRService.on("OrderStatusUpdated", handleUpdate);
          signalRService.on("OrderDetailUpdated", handleDetailUpdate);
          signalRService.on("UpdateEmployeeOrderList", handleUpdate);

          await cacheEntryRemoved;
          signalRService.off("OrderStatusUpdated", handleUpdate);
          signalRService.off("OrderDetailUpdated", handleDetailUpdate);
          signalRService.off("UpdateEmployeeOrderList", handleUpdate);
        } catch (err) {
          console.error("SignalR Detail Error:", err);
        }
      },
    }),

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

    // 3. Confirm Payment (แอดมินยืนยัน)
    confirmPayment: builder.mutation<
      OrderHeader,
      { id: number; paymentMethod: string }
    >({
      query: ({ id, paymentMethod }) => ({
        url: `orders/${id}/confirm-payment`,
        method: "POST",
        body: JSON.stringify(paymentMethod),
        headers: { "Content-Type": "application/json" },
      }),
      // ✅ ล้างแคชทั้งรายชิ้นและหน้ารวม เพื่อให้ข้อมูล Sync ทุกจุด
      invalidatesTags: (_result, _error, arg) => [
        { type: "Order", id: arg.id },
        { type: "Order", id: "LIST" },
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
