import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrlAPI } from "../helpers/SD";
import { unwrapResult } from "../helpers/res";
import type {
  AdminDashboard,
  RevenueChartData,
  TopItem,
} from "../@types/dto/AdminDashboard";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrlAPI,
  }),
  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    // 1. ดึงข้อมูล Dashboard ทั้งหมด
    getFullDashboard: builder.query<AdminDashboard, void>({
      query: () => ({
        url: "dashboards/full",
        method: "GET",
      }),
      transformResponse: unwrapResult<AdminDashboard>,
      providesTags: ["Dashboard"],
    }),

    // 2. ดึงข้อมูลรายได้แบบเลือกช่วงวันที่ และ viewType (day, month, year)
    getRevenueReport: builder.query<
      RevenueChartData[],
      { start: string; end: string; viewType?: string }
    >({
      query: (params) => ({
        url: "dashboards/revenue-report",
        method: "GET",
        params, // ส่ง start, end, viewType ไปเป็น Query String
      }),
      transformResponse: unwrapResult<RevenueChartData[]>,
      providesTags: ["Dashboard"],
    }),

    // 3. ดึงรายการสินค้าขายดี (กำหนดจำนวนได้)
    getTopSellingItems: builder.query<TopItem[], number | void>({
      query: (count = 5) => ({
        url: "dashboards/top-selling",
        method: "GET",
        params: { count },
      }),
      transformResponse: unwrapResult<TopItem[]>,
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetFullDashboardQuery,
  useGetRevenueReportQuery,
  useGetTopSellingItemsQuery,
} = dashboardApi;
