/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { MenuItemDto } from "../@types/dto/MenuItem";
import { baseUrlAPI } from "../helpers/SD";
import type { PaginationMeta } from "../@types/Responsts/PaginationMeta";
import type { ApiResponse } from "../@types/Responsts/ApiResponse";
import type { CreateMenuItem } from "../@types/createDto/createMenuItem";
import type { UpdateMenuItem } from "../@types/UpdateDto/updateMenuItem";
import { unwrapResult } from "../helpers/res";
import { toFormData } from "../helpers/toFormDataHelper";

export const menuItemApi = createApi({
  reducerPath: "menuItemApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrlAPI,
  }),
  tagTypes: ["Menu"],
  endpoints: (builder) => ({
    getMenuItems: builder.query<
      { result: MenuItemDto[]; meta: PaginationMeta },
      { pageNumber?: number; pageSize?: number }
    >({
      query: (params) => ({
        url: "menuItems/getall",
        method: "GET",
        params,
      }),
      transformResponse: (response: ApiResponse<MenuItemDto[]>) => ({
        result: response.result ?? [],
        meta: response.meta as PaginationMeta,
      }),
      providesTags: ["Menu"],
    }),

    getMenuItemById: builder.query<MenuItemDto, number>({
      query: (id) => `menuItems/getby/${id}`,
      transformResponse: unwrapResult<MenuItemDto>,
      providesTags: (_result, _error, id) => [{ type: "Menu", id }],
    }),

    createMenuItem: builder.mutation<MenuItemDto, CreateMenuItem>({
      query: (data) => ({
        url: "menuItems/create",
        method: "POST",
        body: toFormData(data),
      }),
      transformResponse: unwrapResult<MenuItemDto>,
      invalidatesTags: ["Menu"],
    }),

    updateMenuItem: builder.mutation<
      MenuItemDto,
      { id: number; data: UpdateMenuItem }
    >({
      query: ({ id, data }) => ({
        url: `menuItems/update/${id}`,
        method: "PUT",
        body: toFormData(data),
      }),
      transformResponse: unwrapResult<MenuItemDto>,
      invalidatesTags: ["Menu"],
    }),

    deleteMenuItem: builder.mutation<void, number>({
      query: (id) => ({
        url: `menuItems/delete/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<unknown>) => {
        if (!response.isSuccess) {
          throw new Error(response.message || "Delete failed");
        }
        return;
      },
      invalidatesTags: ["Menu"],
    }),
  }),
});

export const {
  useGetMenuItemsQuery,
  useGetMenuItemByIdQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation
} = menuItemApi;

export default menuItemApi;