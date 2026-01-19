/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrlAPI } from "../helpers/SD";
import type { AddToCart } from "../@types/createDto/AddToCart";
import type { ApiResponse } from "../@types/Responsts/ApiResponse";
import type { UpdateCartItem } from "../@types/UpdateDto/UpdateCartItem";
import type { Cart } from "../@types/dto/Cart";

export const shoppingCartApi = createApi({
  reducerPath: "ShoppingCart",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrlAPI,
    prepareHeaders: (headers) => {
        // (Optional) ถ้ามีการส่ง JWT Token สำหรับ Member ให้ใส่ตรงนี้
        const token = localStorage.getItem("token"); // หรือดึงจาก State
        if (token) {
          headers.set("authorization", `Bearer ${token}`);
        }
        return headers;
    },
  }),
  tagTypes: ["ShoppingCart"],
  endpoints: (builder) => ({

    // ✅ 1. GetCart: ดึงข้อมูลตะกร้า (เปลี่ยน Return Type เป็น CartDto)
    getCart: builder.query<Cart, string | null>({
      query: (cartToken) => ({
        url: "shoppingcarts",
        method: "GET",
        params: { cartToken }, // ส่งเป็น Query String: ?cartToken=...
      }),
      transformResponse: (response: ApiResponse<Cart>) => {
        if (!response.isSuccess) throw new Error(response.message);
        return response.result!;
      },
      providesTags: ["ShoppingCart"],
    }),

    // ✅ 2. AddToCart: เพิ่มของ (ต้อง Return CartDto เพื่อเอา Token ใหม่)
    addtoCart: builder.mutation<Cart, AddToCart>({
      query: (body) => ({
        url: "shoppingcarts",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<Cart>) => {
        if (!response.isSuccess) throw new Error(response.message);
        return response.result!; // ส่งผลลัพธ์กลับไปให้ Component เพื่อเก็บ Token
      },
      invalidatesTags: ["ShoppingCart"],
    }),

    // ✅ 3. UpdateCartItem: แก้ไขจำนวน/Note
    updateCartItem: builder.mutation<void, UpdateCartItem>({
      query: (data) => ({
        url: "shoppingcarts/updateItem",
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<any>) => {
        if (!response.isSuccess) throw new Error(response.message);
      },
      invalidatesTags: ["ShoppingCart"],
    }),

    // ✅ 4. RemoveCartItem: ลบสินค้าออก
    removeCartItem: builder.mutation<void, { id: number; cartToken: string }>({
      query: ({ id, cartToken }) => ({
        url: `shoppingcarts/item/${id}`,
        method: "DELETE",
        params: { cartToken }, // ส่ง cartToken ไปยืนยันตัวตน
      }),
      transformResponse: (response: ApiResponse<any>) => {
        if (!response.isSuccess) throw new Error(response.message);
      },
      invalidatesTags: ["ShoppingCart"],
    }),

    // ✅ 5. ClearCart: ล้างตะกร้า
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