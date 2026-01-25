/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrlAPI } from "../helpers/SD";
import type { ApiResponse } from "../@types/Responsts/ApiResponse";
import type { Cart } from "../@types/dto/Cart";
import type { AddToCart } from "../@types/createDto/AddToCart";
import type { UpdateCartItem } from "../@types/UpdateDto/UpdateCartItem";
import { signalRService } from "./signalrService";

export const shoppingCartApi = createApi({
  reducerPath: "ShoppingCart",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrlAPI,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["ShoppingCart"],
  endpoints: (builder) => ({

    // ✅ 1. GetCart: พร้อมระบบ Auto-Sync ผ่าน SignalR
    getCart: builder.query<Cart, string | null>({
      query: (cartToken) => ({
        url: "shoppingcarts",
        method: "GET",
        params: { cartToken },
      }),
      transformResponse: (response: ApiResponse<Cart>) => {
        if (!response.isSuccess) throw new Error(response.message);
        return response.result!;
      },
      // 🔥 หัวใจหลัก: ดักฟัง SignalR และอัปเดต Cache ของตัวเอง
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          // รอจนกว่าการยิง API ครั้งแรกจะสำเร็จ
          await cacheDataLoaded;

          // สร้าง Function Listener สำหรับเหตุการณ์ CartUpdated
          const cartUpdatedListener = (updatedCart: Cart) => {
            // อัปเดตข้อมูลใน Cache ของ RTK Query ทันที
            updateCachedData((draft) => {
              if (draft) {
                Object.assign(draft, updatedCart);
              }
            });
          };

          // สร้าง Function Listener สำหรับเหตุการณ์ CartCleared
          const cartClearedListener = () => {
            updateCachedData((draft) => {
              if (draft) {
                draft.cartItems = [];
                draft.totalAmount = 0;
                draft.totalItemsCount = 0;
              }
            });
          };

          // ลงทะเบียนการฟังเหตุการณ์จาก SignalR
          signalRService.on("CartUpdated", cartUpdatedListener);
          signalRService.on("CartCleared", cartClearedListener);

        } catch (error) {
          console.error("SignalR Cache Update Error:", error);
        }

        // เมื่อ Component ที่ใช้งาน Hook นี้ถูกทำลาย (Unmount) ให้ยกเลิกการฟัง
        await cacheEntryRemoved;
        signalRService.off("CartUpdated");
        signalRService.off("CartCleared");
      },
      providesTags: ["ShoppingCart"],
    }),

    // ✅ 2. AddToCart
    addtoCart: builder.mutation<Cart, AddToCart>({
      query: (body) => ({
        url: "shoppingcarts",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<Cart>) => {
        if (!response.isSuccess) throw new Error(response.message);
        return response.result!;
      },
      invalidatesTags: ["ShoppingCart"],
    }),

    // ✅ 3. UpdateCartItem
    updateCartItem: builder.mutation<void, UpdateCartItem>({
      query: (data) => ({
        url: "shoppingcarts/updateItem",
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<any>) => {
        if (!response.isSuccess) throw new Error(response.message);
      },
      // ไม่ต้องใช้ invalidatesTags ก็ได้ถ้าคุณมั่นใจว่า SignalR จะส่งข้อมูลกลับมาอัปเดตเอง
      // แต่ใส่ไว้เพื่อความชัวร์ (Fallback) ก็ไม่เสียหายครับ
      invalidatesTags: ["ShoppingCart"],
    }),

    // ✅ 4. RemoveCartItem
    removeCartItem: builder.mutation<void, { id: number; cartToken: string }>({
      query: ({ id, cartToken }) => ({
        url: `shoppingcarts/item/${id}`,
        method: "DELETE",
        params: { cartToken },
      }),
      transformResponse: (response: ApiResponse<any>) => {
        if (!response.isSuccess) throw new Error(response.message);
      },
      invalidatesTags: ["ShoppingCart"],
    }),

    // ✅ 5. ClearCart
    clearCart: builder.mutation<void, string>({
      query: (cartToken) => ({
        url: "shoppingcarts",
        method: "DELETE",
        params: { cartToken },
      }),
      transformResponse: (response: ApiResponse<any>) => {
        if (!response.isSuccess) throw new Error(response.message);
      },
      invalidatesTags: ["ShoppingCart"],
    }),

  }),
});

export const {
  useGetCartQuery,
  useAddtoCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} = shoppingCartApi;

export default shoppingCartApi;