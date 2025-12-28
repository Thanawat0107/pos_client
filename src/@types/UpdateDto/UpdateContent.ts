export interface UpdateContent {
  contentType?: string;
  title?: string;
  description?: string;

  // ถ้าส่งมา = เปลี่ยนรูปใหม่, ถ้าไม่ส่ง (null) = ใช้รูปเดิม
  imageUrl?: string;
  fileImage?: File;

  // --- ส่วนโปรโมชั่น ---
  discountType?: string;
  discountValue?: number;
  minOrderAmount?: number;
  promoCode?: string;

  // --- Common ---
  startDate?: Date;
  endDate?: Date;
  isUsed?: boolean;
}
