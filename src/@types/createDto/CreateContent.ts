export interface CreateContent {
  contentType: string; // เช่น "News", "Promotion"
  title: string;
  description?: string;

  // รับเป็นไฟล์สำหรับการอัปโหลด
  imageUrl?: string;
  fileImage?: File;

  // --- ส่วนโปรโมชั่น (Optional: ไม่บังคับใส่) ---
  discountType?: string; // เช่น "Percent", "Amount"
  discountValue?: number;
  minOrderAmount?: number;
  // ❌ ไม่ต้องมี promoCode (ระบบ Gen ให้)

  // ⭐ Usage limits (NEW - Admin สามารถตั้งค่าได้)
  maxUsageCount?: number;        // จำกัดทั้งหมด (null = ไม่จำกัด)
  maxUsagePerUser?: number;      // 1 คนใช้ได้กี่ครั้ง

  // --- ระยะเวลา ---
  startDate: Date;
  endDate?: Date;
  isPermanent: boolean;
}
