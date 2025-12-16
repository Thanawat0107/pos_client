export interface CreateManual {
  content: string;
  category: string;
  targetRole: string;
  // ส่งมาเป็น URL (กรณีอัปโหลดไฟล์แยกแล้วเอา Link มาแปะ)
  fileUrl?: string | null;
  file?: File | null;
  // UserId ดึงจาก Token ใน Controller เอาครับ ปลอดภัยกว่า
}
