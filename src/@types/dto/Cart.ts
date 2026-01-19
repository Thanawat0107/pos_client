import type { CartItem } from "./CartItem";

export interface Cart {
  id: number;
  cartToken: string;
  userId?: string | null;
  totalAmount: number;
  totalItemsCount: number;
  cartItems: CartItem[];
}