export interface CancelRequest {
  userId?: string;
  guestToken?: string;
  isAdmin: boolean;
  orderItemId?: number;
};