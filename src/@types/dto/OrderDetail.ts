import { OrderDetailOption } from "./OrderDetailOption";

export interface OrderDetail {
  id: number;
  menuItemId: number;
  menuItemName: string;
  menuItemImage: string;
  
  unitPrice: number;
  quantity: number;
  extraPrice: number;
  totalPrice: number;
  note?: string;

  orderDetailOptions: OrderDetailOption[];

  isCancelled: boolean;
  updatedAt: string;
  cancelledAt: string;
}