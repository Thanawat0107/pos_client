export interface Content {
  id: number;
  contentType: string;
  title: string;
  description: string;
  imageUrl?: string;

  // --- ส่วนโปรโมชั่น ---
  discountType?: string;
  discountValue?: number;
  minOrderAmount?: number;
  promoCode?: string;

  // --- Common ---
  startDate: Date;
  endDate?: Date;
  isUsed: boolean;
  createdAt: Date;
  userId: string;
}
