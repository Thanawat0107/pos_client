import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrlAPI } from "../helpers/SD";
import type { PaginationMeta } from "../@types/Responsts/PaginationMeta";
import type { ApiResponse } from "../@types/Responsts/ApiResponse";
import { unwrapResult } from "../helpers/res";
import { toFormData } from "../helpers/toFormDataHelper";
import type { Content } from "../@types/dto/Content";
import type { CreateContent } from "../@types/createDto/CreateContent";
import type { UpdateContent } from "../@types/UpdateDto/UpdateContent";
// --- นำเข้า signalRService ที่เราเพิ่งสร้าง ---
import { signalRService } from "../services/signalrService"; 

export const contentApi = createApi({
  reducerPath: "contentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrlAPI,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("authorization", `Bearer ${token}`);

      const guestToken = localStorage.getItem("guestToken");
      if (guestToken) headers.set("X-Guest-Token", guestToken);

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

      // --- ส่วนของ SignalR Real-time Update ---
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        try {
          // รอให้ข้อมูลรอบแรกโหลดจาก API สำเร็จก่อน
          await cacheDataLoaded;

          // 1. ดักฟังเหตุการณ์: มีการสร้าง Content ใหม่
          signalRService.on("ReceiveNewContent", (newContent: Content) => {
            updateCachedData((draft) => {
              // เพิ่มข้อมูลใหม่เข้าไปที่แถวบนสุดของอาร์เรย์
              draft.result.unshift(newContent);
              draft.meta.totalCount += 1;
            });
          });

          // 2. ดักฟังเหตุการณ์: ข้อมูล Content ถูกแก้ไข หรือ โควตาถูกคืน (PromotionAvailable)
          const handleUpdate = (updatedContent: Content) => {
            updateCachedData((draft) => {
              const index = draft.result.findIndex(
                (c) => c.id === updatedContent.id,
              );
              if (index !== -1) {
                draft.result[index] = updatedContent;
              }
            });
          };
          signalRService.on("ContentUpdated", handleUpdate);
          signalRService.on("PromotionAvailable", handleUpdate); // เมื่อโควตาคืนมา ให้ใช้ลอจิกเดียวกัน

          // 3. ดักฟังเหตุการณ์: มีการลบ Content
          signalRService.on("ContentDeleted", (deletedId: number) => {
            updateCachedData((draft) => {
              draft.result = draft.result.filter((c) => c.id !== deletedId);
              draft.meta.totalCount -= 1;
            });
          });

          // 4. ดักฟังเหตุการณ์: อัปเดตยอดการใช้งานโปรโมชั่น (PromotionUsageUpdated)
          signalRService.on(
            "PromotionUsageUpdated",
            (data: { id: number; current: number }) => {
              updateCachedData((draft) => {
                const content = draft.result.find((c) => c.id === data.id);
                if (content) {
                  content.currentUsageCount = data.current; // อัปเดตเฉพาะเลขโควตา
                }
              });
            },
          );

          // 5. ดักฟังเหตุการณ์: โปรโมชั่นสิทธิ์เต็ม (ContentSoldOut)
          signalRService.on("ContentSoldOut", (soldOutId: number) => {
            updateCachedData((draft) => {
              // คุณอาจจะลบออกไปเลย หรือจะเปลี่ยนสถานะในหน้าจอให้กดไม่ได้ก็ได้
              // ในที่นี้เลือกลบออกจากรายการที่ User เห็น (เพื่อให้ตรงกับลอจิก Get Active ใน Backend)
              draft.result = draft.result.filter((c) => c.id !== soldOutId);
            });
          });
        } catch {
          // ถ้าเกิดข้อผิดพลาดในการโหลด Cache ไม่ต้องทำอะไร
        }

        // เมื่อ Component ถูกทำลาย (Unmount) ให้หยุดฟัง Event เพื่อประหยัด Memory
        await cacheEntryRemoved;
        signalRService.off("ReceiveNewContent");
        signalRService.off("ContentUpdated");
        signalRService.off("ContentDeleted");
        signalRService.off("PromotionUsageUpdated");
        signalRService.off("ContentSoldOut");
        signalRService.off("PromotionAvailable");
      },
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
        if (!response.isSuccess)
          throw new Error(response.message || "Delete failed");
        return;
      },
      invalidatesTags: ["Content"],
    }),

    // ปรับจาก string เป็น object { code, amount, userId, guestToken }
    verifyPromo: builder.query<
      ApiResponse<Content>,
      { code: string; amount: number; userId?: string; guestToken?: string }
    >({
      query: (arg) => ({
        url: `contents/verify-promo/${arg.code}`,
        method: "GET",
        params: {
          currentOrderAmount: arg.amount,
          userId: arg.userId,
          guestToken: arg.guestToken,
        },
        headers: {
          "X-Guest-Token": arg.guestToken || "",
        },
      }),
    }),
  }),
});

export const {
  useGetContentsQuery,
  useGetContentByIdQuery,
  useCreateContentMutation,
  useUpdateContentMutation,
  useDeleteContentMutation,
  useVerifyPromoQuery,     // แบบเรียกใช้ทันที
  useLazyVerifyPromoQuery, // ✅ เพิ่มตัวนี้สำหรับปุ่ม "ใช้โค้ด"
} = contentApi;