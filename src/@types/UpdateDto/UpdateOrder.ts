import type { UpdateOrderDetails } from "./UpdateOrderDetails";

export interface UpdateOrder {
  id: number;          // ⭐ จำเป็น: PK ของ OrderHeader

  // ข้อมูลลูกค้า
  customerName?: string;
  customerPhone?: string;
  customerNote?: string;

  // การจัดการ
  estimatedPickUpTime?: string; // ISO String ("2024-05-20T10:00:00Z")
  orderStatus?: string;         // 'PendingPayment' | 'Preparing' | ...
  discount?: number;            // แก้ส่วนลดท้ายบิล

  // รายการสินค้าที่จะแก้ไข (ส่งมาเฉพาะรายการที่เปลี่ยนก็ได้)
  orderDetails?: UpdateOrderDetails[];
}