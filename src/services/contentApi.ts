import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrlAPI } from "../helpers/SD";
import type { PaginationMeta } from "../@types/Responsts/PaginationMeta";
import type { ApiResponse } from "../@types/Responsts/ApiResponse";
import { unwrapResult } from "../helpers/res";
import { toFormData } from "../helpers/toFormDataHelper";
import type { Content } from "../@types/dto/Content";
import type { CreateContent } from "../@types/createDto/CreateContent";
import type { UpdateContent } from "../@types/UpdateDto/UpdateContent";

export const contentApi = createApi({
  reducerPath: "contentApi",
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
  tagTypes: ["Content"],
  endpoints: (builder) => ({
    getContents: builder.query<
      { result: Content[]; meta: PaginationMeta },
      { pageNumber?: number; pageSize?: number }
    >({
      query: (params) => ({
        url: "contents/getall",
        method: "GET",
        params,
      }),
      transformResponse: (response: ApiResponse<Content[]>) => ({
        result: response.result ?? [],
        meta: response.meta as PaginationMeta,
      }),
      providesTags: ["Content"],
    }),

    getContentById: builder.query<Content, number>({
      query: (id) => `contents/getby/${id}`,
      transformResponse: unwrapResult<Content>,
      providesTags: (_result, _error, id) => [{ type: "Content", id }],
    }),

    createContent: builder.mutation<Content, CreateContent>({
      query: (data) => ({
        url: "contents/create",
        method: "POST",
        body: toFormData(data),
      }),
      transformResponse: unwrapResult<Content>,
      invalidatesTags: ["Content"],
    }),

    updateContent: builder.mutation<
      Content,
      { id: number; data: UpdateContent }
    >({
      query: ({ id, data }) => ({
        url: `contents/update/${id}`,
        method: "PUT",
        body: toFormData(data),
      }),
      transformResponse: unwrapResult<Content>,
      invalidatesTags: ["Content"],
    }),

    deleteContent: builder.mutation<void, number>({
      query: (id) => ({
        url: `contents/delete/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<unknown>) => {
        if (!response.isSuccess) {
          throw new Error(response.message || "Delete failed");
        }
        return;
      },
      invalidatesTags: ["Content"],
    }),
  }),
});

export const {
  useGetContentsQuery,
  useGetContentByIdQuery,
  useCreateContentMutation,
  useUpdateContentMutation,
  useDeleteContentMutation,
} = contentApi;

export default contentApi;
