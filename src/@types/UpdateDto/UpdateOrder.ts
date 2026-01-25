import type { UpdateOrderDetails } from "./UpdateOrderDetails";

export interface UpdateOrder {
  id: number;

  // ข้อมูลติดต่อลูกค้าที่อาจต้องแก้ไข
  customerName?: string;
  customerPhone?: string;
  customerNote?: string;

  // การจัดการเวลา (แอดมินอาจเลื่อนเวลานัดรับตามความหนาแน่นของครัว)
  estimatedPickUpTime?: string;

  // การเลื่อนสถานะออเดอร์ (Preparing -> Ready -> Completed)
  orderStatus?: string;

  discount: number;

  orderDetails: UpdateOrderDetails[];
}