export interface Content {
  id: number;
  contentType: string;
  title: string;
  description?: string;
  imageUrl?: string;

  // --- ส่วนโปรโมชั่น ---
  discountType?: string;
  discountValue?: number;
  minOrderAmount?: number;
  promoCode?: string;

  // ⭐ Usage tracking fields (NEW)
  maxUsageCount?: number;        // null = ไม่จำกัด
  currentUsageCount: number;     // ใช้ไปแล้วกี่ครั้ง
  maxUsagePerUser?: number;      // 1 คนใช้ได้กี่ครั้ง

  // --- Common ---
  startDate: Date;
  endDate?: Date;
  isUsed: boolean;
  createdAt: Date;
  userId: string;
}
