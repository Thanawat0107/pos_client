export interface CreateContent {
  contentType: string; // เช่น "News", "Promotion"
  title: string;
  description: string;

  // รับเป็นไฟล์สำหรับการอัปโหลด
  imageUrl?: string;
  fileImage?: File;

  // --- ส่วนโปรโมชั่น (Optional: ไม่บังคับใส่) ---
  discountType?: string; // เช่น "Percent", "Amount"
  discountValue?: number;
  minOrderAmount?: number;
  promoCode?: string;

  // --- ระยะเวลา ---
  startDate: Date;
  endDate: Date;
}
