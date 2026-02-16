/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrlAPI } from "../helpers/SD";

import type {
  AdminDashboard,
  RevenueChartData,
  TopItem,
} from "../@types/dto/AdminDashboard";
import type { DetailedOrderReport } from "../@types/dto/DetailedOrderReport";
// dashboardApi.ts

// 1. สร้าง Local Helper ไว้ใช้เฉพาะในไฟล์นี้ (เพื่อความปลอดภัย)
const unwrapDashboard = <T>(response: any): T => {
  // เช็คว่าถ้ามี .result ให้คืนค่า .result (ตาม pattern เดิม)
  if (response && response.result !== undefined && response.result !== null) {
    return response.result;
  }
  // ถ้าไม่มี .result แต่ตัว response เองมีข้อมูล (เช่น เป็น Array หรือ Object)
  // ให้คืนค่า response นั้นไปเลย ไม่ต้อง throw error
  return response as T;
};

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrlAPI,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token"); // หรือดึงจาก Auth State
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    getFullDashboard: builder.query<
      AdminDashboard,
      { start?: string; end?: string } | void
    >({
      query: (params) => ({
        url: "dashboards/full",
        params: params || {},
      }),
      transformResponse: (res) => unwrapDashboard<AdminDashboard>(res),
      providesTags: ["Dashboard"],
    }),
    getRevenueReport: builder.query<
      RevenueChartData[],
      { start: string; end: string; viewType?: string }
    >({
      query: (params) => ({
        url: "dashboards/revenue-report",
        params,
      }),
      // เปลี่ยนมาใช้ Local Helper แทน
      transformResponse: (res) => unwrapDashboard<RevenueChartData[]>(res),
      providesTags: ["Dashboard"],
    }),

    getTopSellingItems: builder.query<
      TopItem[],
      { count?: number; start?: string; end?: string } | void
    >({
      query: (params) => ({
        url: "dashboards/top-selling",
        params: {
          count: params?.count ?? 5,
          start: params?.start,
          end: params?.end,
        },
      }),
      transformResponse: (res) => unwrapDashboard<TopItem[]>(res),
      providesTags: ["Dashboard"],
    }),

    getDetailedReport: builder.query<
      DetailedOrderReport[],
      { start: string; end: string; search?: string }
    >({
      query: (params) => ({
        url: "dashboards/detailed-report",
        params: {
          start: params.start,
          end: params.end,
          search: params.search || "",
        },
      }),
      transformResponse: (res) => unwrapDashboard<DetailedOrderReport[]>(res),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetFullDashboardQuery,
  useGetRevenueReportQuery,
  useGetTopSellingItemsQuery,
  useGetDetailedReportQuery,
} = dashboardApi;
