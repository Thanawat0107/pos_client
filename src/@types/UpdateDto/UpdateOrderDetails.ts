import type { UpdateOrderDetailsOption } from "./UpdateOrderDetailOption";

export interface UpdateOrderDetails {
  id: number;

  // สถานะรายจานสำหรับครัว
  kitchenStatus?: string; // WAITING, COOKING, DONE, CANCELLED
  isReady?: boolean; // ติ๊กเมื่อจานนี้เสร็จพร้อมส่ง

  // จัดการกรณีของหมด/ยกเลิก
  isCancelled?: boolean;
  isRefunded?: boolean; // ยืนยันว่าคืนเงินรายการนี้แล้ว

  // หมายเหตุเพิ่มเติม (เช่น พ่อครัวอาจโน้ตกลับไปหาลูกค้า)
  note?: string;
  quantity?: number;

  orderDetailOptions?: UpdateOrderDetailsOption[];
}
