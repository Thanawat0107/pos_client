import type { CreateOrderDetails } from "./CreateOrderDetails";

export interface CreateOrder {
  // เปลี่ยนจาก OrderType เป็นระบุ Channel ไปเลย (เช่น PickUp)
  channel: string;

  // ข้อมูลติดต่อลูกค้า (สำคัญมากสำหรับ PickUp)
  customerPhone: string;
  customerName?: string;
  customerNote?: string;

  // ข้อมูลระบุตัวตน (เพื่อเช็คสิทธิ์ส่วนลด 1 คน/ครั้ง)
  userId?: string; // สำหรับสมาชิก
  guestToken?: string; // สำหรับ Guest (รหัสสุ่มจาก Browser)

  // ระบบส่วนลด
  promoCode?: string; // ลูกค้ากรอกรหัสตรงนี้

  // การนัดหมาย
  estimatedPickUpTime?: string;

  orderDetails: CreateOrderDetails[];
}