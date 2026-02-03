export interface PaymentQRResponse {
  success: boolean;
  qrImage: string; // Base64 string
  message?: string;
}