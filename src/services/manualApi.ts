import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrlAPI } from "../helpers/SD";
import type { PaginationMeta } from "../@types/Responsts/PaginationMeta";
import type { ApiResponse } from "../@types/Responsts/ApiResponse";
import { unwrapResult } from "../helpers/res";
import { toFormData } from "../helpers/toFormDataHelper";
import type { Manual } from "../@types/dto/Manual"; 
import type { CreateManual } from "../@types/createDto/CreateManual";
import type { UpdateManual } from "../@types/UpdateDto/UpdateManual";

export const manualApi = createApi({
  reducerPath: "manualApi",
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
  tagTypes: ["Manual"],
  endpoints: (builder) => ({
    getManuals: builder.query<
      { result: Manual[]; meta: PaginationMeta },
      {
        pageNumber?: number;
        pageSize?: number;
        category?: string;
      }
    >({
      query: (params) => ({
        url: "manuals/getall",
        method: "GET",
        params,
      }),
      transformResponse: (response: ApiResponse<Manual[]>) => ({
        result: response.result ?? [],
        meta: response.meta as PaginationMeta,
      }),
      providesTags: ["Manual"],
    }),

    getManualById: builder.query<Manual, number>({
      query: (id) => `manuals/getby/${id}`,
      transformResponse: unwrapResult<Manual>,
      providesTags: (_result, _error, id) => [{ type: "Manual", id }],
    }),

    createManual: builder.mutation<Manual, CreateManual>({
      query: (data) => ({
        url: "manuals/create",
        method: "POST",
        body: toFormData(data),
      }),
      transformResponse: unwrapResult<Manual>,
      invalidatesTags: ["Manual"],
    }),

    updateManual: builder.mutation<Manual, { id: number; data: UpdateManual }>({
      query: ({ id, data }) => ({
        url: `manuals/update/${id}`,
        method: "PUT",
        body: toFormData(data),
      }),
      transformResponse: unwrapResult<Manual>,
      invalidatesTags: ["Manual"],
    }),

    deleteManual: builder.mutation<void, number>({
      query: (id) => ({
        url: `manuals/delete/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<unknown>) => {
        if (!response.isSuccess) {
          throw new Error(response.message || "Delete failed");
        }
        return;
      },
      invalidatesTags: ["Manual"],
    }),
  }),
});

export const {
  useGetManualsQuery,
  useGetManualByIdQuery,
  useCreateManualMutation,
  useUpdateManualMutation,
  useDeleteManualMutation,
} = manualApi;

export default manualApi;