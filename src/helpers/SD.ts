export const baseUrl = "https://localhost:7061";
// export const baseUrl = "/cs66/s07/cnmswep";
export const baseUrlAPI = baseUrl + "/api/";

export const ROLES = [
  { value: "admin", label: "ผู้ดูแลระบบ (Admin)" },
  { value: "employee", label: "พนักงานทั่วไป (Employee)" },
  { value: "customer", label: "ลูกค้า (Customer)" },
  { value: "All", label: "ทุกคน (All)" },
];

export const Channel = {
  Channel_PickUp: "pickUp", // รับที่ร้าน
};

export const paymentMethods = {
  paymentStatus_PromptPay: "promptPay", // รอชำระเงิน
  paymentStatus_Cash: "cash", // ชำระเงินแล้ว
}

export const Sd = {
  Status_PendingPayment: "pendingPayment", // รอชำระเงิน
  Status_Paid: "paid", // ชำระเงินแล้ว/รอคิว
  Status_Pending: "pending", // รอดำเนินการ
  Status_Approved: "approved", 
  Status_Preparing: "preparing", // กำลังจัดเตรียมอาหาร
  Status_Ready: "ready", // อาหารเสร็จแล้ว/รอรับ
  Status_Completed: "completed", // จบออเดอร์/รับของแล้ว
  Status_Cancelled: "cancelled", // ยกเลิกออเดอร์
  Status_Closed: "closed", // ปิดตะกร้า/ปิดการขาย

  // --- Kitchen Status (KDS) ---
  KDS_Waiting: "WAITING", // รอคิวทำ
  KDS_Cooking: "COOKING", // กำลังทำ
  KDS_Done: "DONE", // ทำเสร็จแล้ว
  KDS_None: "NONE", // ไม่มีสถานะ
  KDS_Cancelled: "CANCELLED", // ยกเลิกรายการนี้
};

export const SD_ServiceType = {
  Water: "water",       // น้ำดื่ม
  Utensils: "utensils", // อุปกรณ์ (ช้อนส้อม)
  Restroom: "restroom", // ห้องน้ำ
} as const;

export type SD_ServiceType = typeof SD_ServiceType[keyof typeof SD_ServiceType];