export interface UpdateCartItem {
  cartToken: string;
  cartItemId: number;
  quantity: number;

  // ✅ allow editing note
  note?: string;
}