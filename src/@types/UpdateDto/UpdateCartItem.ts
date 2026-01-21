export interface UpdateCartItemDto {
  cartToken: string;
  cartItemId: number;
  quantity: number;

  // ✅ allow editing note
  note?: string;
}