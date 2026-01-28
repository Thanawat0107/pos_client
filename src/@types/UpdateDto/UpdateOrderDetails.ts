import type { UpdateOrderDetailsOption } from "./UpdateOrderDetailOption";

export interface UpdateOrderDetails {
  id: number;          // ⭐ จำเป็น: เพื่อบอกว่าจะแก้จานไหน

  // กลุ่มสถานะ (ส่งเฉพาะตัวที่จะเปลี่ยน)
  kitchenStatus?: string; // 'WAITING' | 'COOKING' | 'DONE' | 'CANCELLED'
  isReady?: boolean;
  
  // กลุ่มยกเลิก/คืนเงิน
  isCancelled?: boolean;
  isRefunded?: boolean;

  // กลุ่มข้อมูลทั่วไป
  note?: string;
  quantity?: number;

  // ถ้าจะแก้ Option ย่อย ให้ส่ง List นี้มาด้วย
  orderDetailOptions?: UpdateOrderDetailsOption[]; 
}
