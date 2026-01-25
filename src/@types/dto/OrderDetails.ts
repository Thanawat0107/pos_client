import type { OrderDetailsOption } from "./OrderDetailsOption";

export interface OrderDetails {
  id: number;
  menuItemId: number;
  menuItemName: string;
  menuItemImage: string;

  unitPrice: number;
  quantity: number;
  extraPrice: number;
  totalPrice: number;
  note?: string;

  // --- สถานะสำหรับ KDS และ Tracking ---
  kitchenStatus: string; // WAITING, COOKING, DONE, CANCELLED
  queueNo?: string;
  isReady: boolean;
  readyAt?: string;

  // --- สถานะการยกเลิก/คืนเงิน ---
  isCancelled: boolean;
  isRefunded: boolean;
  cancelledAt?: string;

  // ดึงตัวเลือกเสริม (Options) มาโชว์ด้วย
  orderDetailOptions: OrderDetailsOption[];
}