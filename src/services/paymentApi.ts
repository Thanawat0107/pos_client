import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrlAPI } from "../helpers/SD";
import type { PaymentQRResponse } from "../@types/Responsts/PaymentQRResponse";
import type { ConfirmPaymentResponse } from "../@types/Responsts/ConfirmPaymentResponse";
import type { ConfirmPaymentRequest } from "../@types/requests/ConfirmPaymentRequest";
import { toFormData } from "../helpers/toFormDataHelper";
import { signalRService } from "./signalrService";

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({ baseUrl: baseUrlAPI }),
  tagTypes: ["Payment", "Order"],
  endpoints: (builder) => ({
    getPaymentQR: builder.query<PaymentQRResponse, number>({
      query: (orderId) => ({
        url: `payments/qr/${orderId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Payment", id }],

      // 2. ใช้ Logic นี้ในการ Subscribe Event ผ่าน Service เดิม
      async onCacheEntryAdded(
        orderId,
        { cacheDataLoaded, cacheEntryRemoved, dispatch },
      ) {
        try {
          // รอให้ข้อมูล QR โหลดเสร็จก่อน
          await cacheDataLoaded;

          // 3. ตรวจสอบ/เริ่มการเชื่อมต่อ (Service คุณมี Logic เช็ค state อยู่แล้ว เรียกซ้ำได้ไม่พัง)
          await signalRService.startConnection();

          // 4. สร้าง Callback Function เตรียมไว้ (ต้องสร้างเป็นตัวแปร เพื่อให้สั่ง off ได้ถูกตัว)
          const handleStatusUpdate = (
            updatedOrderId: number,
            newStatus: string,
          ) => {
            // เช็คว่าเป็น Order เดียวกันไหม
            if (updatedOrderId === orderId) {
              console.log(
                `Order ${orderId} updated via SignalR to: ${newStatus}`,
              );

              // สั่ง Invalidate เพื่อให้ RTK Query ไปดึงข้อมูลใหม่
              dispatch(paymentApi.util.invalidateTags(["Payment", "Order"]));
            }
          };

          // 5. Subscribe Event: ใช้ on ของ Service คุณ
          signalRService.on("ReceiveOrderStatusUpdate", handleStatusUpdate);

          // 6. Cleanup: รอจนกว่า Component นี้จะถูกทำลาย (Unmount)
          await cacheEntryRemoved;

          // 7. Unsubscribe: ใช้ off ของ Service คุณ (ส่ง callback ตัวเดิมไปเพื่อลบออกจาก array)
          signalRService.off("ReceiveOrderStatusUpdate", handleStatusUpdate);
        } catch (err) {
          console.error("SignalR integration error:", err);
        }
      },
    }),

    confirmPayment: builder.mutation<
      ConfirmPaymentResponse,
      ConfirmPaymentRequest
    >({
      query: (data) => ({
        url: "payments/confirm",
        method: "POST",
        body: toFormData(data),
      }),
      invalidatesTags: ["Payment", "Order"],
    }),
  }),
});

export const { useGetPaymentQRQuery, useConfirmPaymentMutation } = paymentApi;

export default paymentApi;
