export interface UpdateContent {
  contentType?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  fileImage?: File;

  // --- ส่วนโปรโมชั่น ---
  discountType?: string;
  discountValue?: number;
  minOrderAmount?: number;
  // ❌ ไม่ต้องมี promoCode (แก้ไม่ได้)

  // ⭐ Usage limits (NEW - แก้ไขได้)
  maxUsageCount?: number;
  maxUsagePerUser?: number;
  // ❌ ไม่ต้องมี currentUsageCount (แก้ไม่ได้ ให้ระบบจัดการ)

  // --- Common ---
  startDate?: Date;
  endDate?: Date;
  isPermanent?: boolean;
  isUsed?: boolean;
}
