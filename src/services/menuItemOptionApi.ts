import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { MenuItemOption } from "../@types/dto/MenuItemOption";
import { baseUrlAPI } from "../helpers/SD";
import type { PaginationMeta } from "../@types/Responsts/PaginationMeta";
import type { ApiResponse } from "../@types/Responsts/ApiResponse";
import { unwrapResult } from "../helpers/res";
import type { CreateMenuItemOption } from "../@types/createDto/CreateMenuItemOption";
import type { UpdateMenuItemOption } from "../@types/UpdateDto/UpdateMenuItemOption";

export const menuItemOptionApi = createApi({
  reducerPath: "menuItemOptionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrlAPI,
  }),
  tagTypes: ["MenuItemOption"],
  endpoints: (builder) => ({
    getMenuItemOptions: builder.query<
      { result: MenuItemOption[]; meta: PaginationMeta },
      { pageNumber?: number; pageSize?: number }
    >({
      query: (params) => ({
        url: "menuItemOptions/getall",
        method: "GET",
        params,
      }),
      transformResponse: (response: ApiResponse<MenuItemOption[]>) => ({
        result: response.result ?? [],
        meta: response.meta as PaginationMeta,
      }),
      providesTags: ["MenuItemOption"],
    }),

    getMenuItemOptionById: builder.query<MenuItemOption, number>({
      query: (id) => `menuItemOptions/getby/${id}`,
      transformResponse: unwrapResult<MenuItemOption>,
      providesTags: (_result, _error, id) => [{ type: "MenuItemOption", id }],
    }),

    createMenuItemOption: builder.mutation<
      MenuItemOption,
      CreateMenuItemOption
    >({
      query: (body) => ({
        url: "menuItemOptions/create",
        method: "POST",
        body,
      }),
      transformResponse: unwrapResult<MenuItemOption>,
      invalidatesTags: ["MenuItemOption"],
    }),

    updateMenuItemOption: builder.mutation<
      MenuItemOption,
      { id: number; data: UpdateMenuItemOption }
    >({
      query: ({ id, data }) => ({
        url: `menuItemOptions/update/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: unwrapResult<MenuItemOption>,
      invalidatesTags: ["MenuItemOption"],
    }),

    deleteMenuItemOption: builder.mutation<void, number>({
      query: (id) => ({
        url: `menuItemOptions/delete/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<unknown>) => {
        if (!response.isSuccess) {
          throw new Error(response.message || "Delete failed");
        }
        return;
      },
      invalidatesTags: ["MenuItemOption"],
    }),
  }),
});

export const {
  useGetMenuItemOptionsQuery,
  useGetMenuItemOptionByIdQuery,
  useCreateMenuItemOptionMutation,
  useUpdateMenuItemOptionMutation,
  useDeleteMenuItemOptionMutation,
} = menuItemOptionApi;