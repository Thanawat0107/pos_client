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
          signalRService.on("UpdateEmployeeOrderList", handleUpdateOrder); // ✅ เพิ่ม

          await cacheEntryRemoved;
          signalRService.off("NewOrderReceived", handleNewOrder);
          signalRService.off("OrderUpdated", handleUpdateOrder);
          signalRService.off("OrderDetailUpdated", handleDetailUpdate);
          signalRService.off("UpdateEmployeeOrderList", handleUpdateOrder); // ✅ เพิ่ม
        } catch (err) {
          console.error("SignalR Admin Error:", err);
        }
      },
    }),

    getOrderById: builder.query<
      OrderHeader,
      { id: number; guestToken?: string; userId?: string }
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

          // ✅ แยก join logic ออกมาเพื่อ re-use ตอน reconnect
          const joinGroups = async () => {
            try {
              await signalRService.invoke("JoinOrderGroup", arg.id.toString());
              if (arg.userId) {
                await signalRService.invoke("JoinUserGroup", `User_${arg.userId}`);
              }
              if (arg.guestToken) {
                const tokens = arg.guestToken.split(",").map((t) => t.trim());
                for (const t of tokens) {
                  if (t) await signalRService.invoke("JoinUserGroup", `Guest_${t}`);
                }
              }
            } catch (e) {
              console.error("SignalR joinGroups error:", e);
            }
          };

          // Join ห้องสำหรับครั้งแรก
          await joinGroups();
          // ✅ Re-join ห้องอัตโนมัติเมื่อ SignalR reconnect
          signalRService.addReconnectedCallback(joinGroups);

          // Handler สำหรับ Header (สถานะแม่)
          const handleUpdate = (updatedOrder: OrderHeader) => {
            if (updatedOrder.id !== arg.id) return;
            updateCachedData((draft) => {
              // เก็บ orderDetailOptions เดิมไว้ก่อน เพราะ payload จาก SignalR
              // อาจส่งมาแบบไม่มี orderDetailOptions (DTO เบา) ทำให้ตัวเลือกเสริมหายไป
              const existingDetails = draft.orderDetails
                ? draft.orderDetails.map((d) => ({
                    id: d.id,
                    orderDetailOptions: d.orderDetailOptions,
                  }))
                : [];

              Object.assign(draft, updatedOrder);

              // คืนค่า orderDetailOptions ให้แต่ละรายการ ถ้า payload ใหม่ไม่มีข้อมูลนั้น
              if (draft.orderDetails) {
                draft.orderDetails.forEach((detail) => {
                  if (
                    !detail.orderDetailOptions ||
                    detail.orderDetailOptions.length === 0
                  ) {
                    const prev = existingDetails.find((d) => d.id === detail.id);
                    if (prev?.orderDetailOptions?.length) {
                      detail.orderDetailOptions = prev.orderDetailOptions;
                    }
                  }
                });
              }
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
          signalRService.on("OrderUpdated", handleUpdate);
          signalRService.on("OrderDetailUpdated", handleDetailUpdate);
          signalRService.on("UpdateEmployeeOrderList", handleUpdate);

          await cacheEntryRemoved;
          // ✅ Cleanup: ลบ reconnect callback เมื่อ cache หมดอายุ
          signalRService.removeReconnectedCallback(joinGroups);
          signalRService.off("OrderStatusUpdated", handleUpdate);
          signalRService.off("OrderUpdated", handleUpdate);
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

          // --- Logic การ Join Group แบบใหม่ (รองรับทั้งคู่พร้อมกัน) ---

          // 1. ถ้ามี UserId ให้ Join ห้องของ User
          if (arg.userId) {
            const userRoom = `User_${arg.userId}`;
            await signalRService.invoke("JoinUserGroup", userRoom);
            console.log(`🔌 [History] Joined User Room: ${userRoom}`);
          }

          // 2. ถ้ามี GuestToken (ไม่ว่าจะ Login หรือไม่) ให้ Join ห้อง Guest ไว้ด้วย
          // เพราะออเดอร์ที่ "กำลังทำ" อาจจะยังใช้ Token เดิมในการส่ง SignalR มาจากหลังบ้าน
          if (arg.guestToken) {
            const tokens = arg.guestToken.split(",").map((t) => t.trim());
            for (const t of tokens) {
              if (t) {
                const guestRoom = `Guest_${t}`;
                await signalRService.invoke("JoinUserGroup", guestRoom);
                console.log(`🔌 [History] Joined Guest Room: ${guestRoom}`);
              }
            }
          }

          // --- Define Handler (เหมือนเดิม) ---
          const handleUpdateList = (updatedOrder: OrderHeader) => {
            updateCachedData((draft) => {
              const index = draft.findIndex((o) => o.id === updatedOrder.id);
              if (index !== -1) {
                draft[index] = updatedOrder;
              } else {
                // ถ้าเป็นออเดอร์ใหม่ที่พึ่งเกิดขึ้น ให้เอาไว้บนสุด
                draft.unshift(updatedOrder);
              }
            });
          };

          // --- Subscribe Events ---
          signalRService.on("OrderStatusUpdated", handleUpdateList);
          signalRService.on("OrderUpdated", handleUpdateList);      // ✅ เพิ่ม
          signalRService.on("NewOrderReceived", handleUpdateList);
          signalRService.on("UpdateEmployeeOrderList", handleUpdateList);

          // --- Cleanup ---
          await cacheEntryRemoved;
          signalRService.off("OrderStatusUpdated", handleUpdateList);
          signalRService.off("OrderUpdated", handleUpdateList);      // ✅ เพิ่ม
          signalRService.off("NewOrderReceived", handleUpdateList);
          signalRService.off("UpdateEmployeeOrderList", handleUpdateList);
        } catch (err) {
          console.error("❌ SignalR History Error:", err);
        }
      },
      providesTags: ["Order"],
    }),

    linkGuestOrders: builder.mutation<
      void,
      { userId: string; guestToken: string }
    >({
      query: (body) => ({
        url: "orders/link-guest-orders",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order"],
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
      invalidatesTags: (_result, _error, arg) => [
        { type: "Order", id: arg.id },
        { type: "Order", id: "LIST" },
      ],
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
  useLinkGuestOrdersMutation,
  useDeleteOrderMutation,
} = orderApi;
