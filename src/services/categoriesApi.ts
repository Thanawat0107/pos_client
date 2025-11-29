import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrlAPI } from "../helpers/SD";
import type { MenuCategory } from "../@types/dto/MenuCategory";
import type { ApiResponse } from "../@types/Responsts/ApiResponse";
import type { CreateMenuCategory } from "../@types/createDto/CreateMenuCategory";
import type { UpdateMenuCategory } from "../@types/UpdateDto/updateMenuCategory";

export const categoriesApi = createApi({
  reducerPath: "categoriesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrlAPI,
  }),
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    getCategories: builder.query<MenuCategory[], void>({
      query: () => "category/getall",
      transformResponse: (response: ApiResponse<MenuCategory[]>) => {
        if (response.result) return response.result;
        throw new Error(response.message);
      },
      providesTags: ["Category"],
    }),

    createCategory: builder.mutation<MenuCategory, CreateMenuCategory>({
      query: (body) => ({
        url: "category/create",
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
        url: `category/update/${id}`,
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
        url: `category/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
    useGetCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoriesApi;