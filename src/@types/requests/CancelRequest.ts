export type CancelRequest = {
  // ส่งมาเพื่อยืนยันว่าเป็นเจ้าของออเดอร์จริงๆ
  userId?: string;
  guestToken?: string;
  isAdmin: boolean;
  orderItemId?: number;
};