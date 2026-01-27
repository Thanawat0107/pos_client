import type { CreateOrderDetailsOption } from "./CreateOrderDetailsOption";

export interface CreateOrderDetails {
  menuItemId: number;
  menuItemName: string; // ส่งชื่อมาเพื่อเป็น Snapshot เบื้องต้น
  unitPrice: number; // ส่งราคามาเพื่อ Re-check กับ DB
  quantity: number;
  note?: string | null; // 🚩 เพิ่ม | null เข้าไป
  orderDetailOptions: CreateOrderDetailsOption[];
}
