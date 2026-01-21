export interface AddToCartDto {
  // --- product info ---
  menuItemId: number;
  quantity: number;
  optionIds?: number[];

  // ✅ per-item note (e.g. no veggies, less spicy)
  note?: string;

  // --- identity info ---
  userId?: string;
  cartToken?: string;
}