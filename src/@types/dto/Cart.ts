import type { CartItemDto } from "./CartItemDto";

export interface Cart {
  id: number;
  cartToken: string;
  userId?: string | null;
  totalAmount: number;
  totalItemsCount: number;
  cartItems: CartItemDto[];
}