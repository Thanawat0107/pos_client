import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrlAPI } from "../helpers/SD";
import type { MenuCategory } from "../@types/dto/MenuCategory";
import type { ApiResponse } from "../@types/Responsts/ApiResponse";
import type { CreateMenuCategory } from "../@types/createDto/CreateMenuCategory";
import type { UpdateMenuCategory } from "../@types/UpdateDto/updateMenuCategory";
import type { PaginationMeta } from "../@types/Responsts/PaginationMeta";

export const categoriesApi = createApi({
  reducerPath: "categoriesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrlAPI,
  }),
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    getCategories: builder.query<
      { result: MenuCategory[]; meta: PaginationMeta },
      { pageNumber?: number; pageSize?: number }
    >({
      query: (params) => ({
        url: "menucategories/getall",
        method: "GET",
        params,
      }),
      transformResponse: (response: ApiResponse<MenuCategory[]>) => ({
        result: response.result ?? [],
        meta: response.meta as PaginationMeta,
      }),
      providesTags: ["Category"],
    }),

    getCategoryById: builder.query<MenuCategory, number>({
      query: (id) => `menucategories/getby/${id}`,
      transformResponse: (response: ApiResponse<MenuCategory>) => {
        if (response.result) return response.result;
        throw new Error(response.message);
      },
      providesTags: (result, error, id) => [{ type: "Category", id }],
    }),

    createCategory: builder.mutation<MenuCategory, CreateMenuCategory>({
      query: (body) => ({
        url: "menucategories/create",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<MenuCategory>) => {
        if (response.result) return response.result;
        throw new Error(response.message);
      },
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation<
      MenuCategory,
      { id: number; data: UpdateMenuCategory }
    >({
      query: ({ id, data }) => ({
        url: `menucategories/update/${id}`,
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<MenuCategory>) => {
        if (response.result) return response.result;
        throw new Error(response.message);
      },
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `menucategories/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
    useGetCategoriesQuery,
    useGetCategoryByIdQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoriesApi;