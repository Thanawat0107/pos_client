export interface UpdateCartItem {
  cartToken: string;
  cartItemId: number;
  quantity: number;

  // ✅ เพิ่ม: ให้แก้ไข Note ได้ด้วย
  note?: string | null;
}