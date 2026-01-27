import type { OrderDetails } from "./OrderDetails";

export interface OrderHeader {
  id: number;
  orderCode: string; // เลขออเดอร์ (O-2024...)
  pickUpCode: string; // รหัสรับอาหาร (A123)
  customerPhone: string; // เบอร์โทรลูกค้า
  channel: string; // ช่องทาง (PickUp)

  userId?: string;
  customerName?: string;
  customerNote?: string;
  orderStatus: string; // PendingPayment, Paid, Preparing...

  // ส่วนลดและโปรโมชั่น
  appliedPromoCode?: string;
  subTotal: number;
  orderTotal: number; // เพิ่ม field นี้
  total: number;

  // วันเวลาสำหรับการติดตามสถานะ (Tracking)
  createdAt: string;
  estimatedPickUpTime?: string;
  paidAt?: string;
  preparingAt?: string;
  readyAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  updatedAt: string;

  orderDetails: OrderDetails[];
}
