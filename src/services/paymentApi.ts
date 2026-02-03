import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrlAPI } from "../helpers/SD";
import type { PaymentQRResponse } from "../@types/Responsts/PaymentQRResponse";
import type { ConfirmPaymentResponse } from "../@types/Responsts/ConfirmPaymentResponse";
import type { ConfirmPaymentRequest } from "../@types/requests/ConfirmPaymentRequest";
import { toFormData } from "../helpers/toFormDataHelper";

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
    }),

    confirmPayment: builder.mutation<ConfirmPaymentResponse, ConfirmPaymentRequest>({
      query: (data) => ({
        url: "payments/confirm",
        method: "POST",
        body: toFormData(data), 
      }),
      invalidatesTags: ["Payment", "Order"],
    }),

  }),
});

export const {
  useGetPaymentQRQuery,
  useConfirmPaymentMutation,
} = paymentApi;

export default paymentApi;