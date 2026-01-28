import type { OrderDetails } from "./OrderDetails";

export interface OrderHeader {
  id: number;
  orderCode: string;
  pickUpCode: string;
  customerPhone: string;
  channel: string;        // เช่น 'PickUp'

  userId?: string;
  customerName?: string;
  customerNote?: string;
  
  // แนะนำ: ใช้ Union Type หรือ Enum สำหรับ OrderStatus ถ้าทำได้
  // เช่น: orderStatus: 'PendingPayment' | 'Paid' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
  orderStatus: string;

  // ส่วนลดและโปรโมชั่น
  appliedPromoCode?: string;
  subTotal: number;       // C# decimal -> TS number
  orderTotal: number;
  total: number;

  // วันเวลา (รับเป็น ISO String เช่น "2024-05-20T14:30:00Z")
  createdAt: string;
  estimatedPickUpTime?: string;
  paidAt?: string;
  preparingAt?: string;
  readyAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  updatedAt: string;

  // รายการสินค้าในออเดอร์
  orderDetails: OrderDetails[];
}
