export interface promoVerificationRequest {
  code: string;
  currentOrderAmount: number;
  userId?: string;
  guestToken?: string;
}