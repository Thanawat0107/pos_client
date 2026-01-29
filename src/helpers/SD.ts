export const baseUrl = "https://localhost:7061";
export const baseUrlAPI = baseUrl + "/api/";


export const ROLES = [
  { value: "admin", label: "ผู้ดูแลระบบ (Admin)" },
  { value: "employee", label: "พนักงานทั่วไป (Employee)" },
  { value: "customer", label: "ลูกค้า (Customer)" },
  { value: "All", label: "ทุกคน (All)" },
];

export const Sd = {
  // --- Order Status (ตรงกับ C# เป๊ะๆ) ---
  Status_PendingPayment: "pendingPayment", // รอชำระเงิน
  Status_Paid: "paid", // ชำระเงินแล้ว/รอคิว
  Status_Preparing: "preparing", // ชำระเงินแล้ว/รอคิว
  Status_Ready: "ready", // อาหารเสร็จแล้ว/รอรับ
  Status_Completed: "completed", // จบออเดอร์/รับของแล้ว
  Status_Cancelled: "cancelled", // ยกเลิกออเดอร์
  Status_Closed: "closed", // ปิดตะกร้า/ปิดการขาย

  // --- Kitchen Status (KDS) ---
  KDS_Waiting: "WAITING", // รอคิวทำ
  KDS_Cooking: "COOKING", // กำลังทำ
  KDS_Done: "DONE", // ทำเสร็จแล้ว
  KDS_Cancelled: "CANCELLED", // ยกเลิกรายการนี้
};