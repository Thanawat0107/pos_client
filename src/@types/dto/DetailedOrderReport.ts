export interface DetailedOrderReport {
  orderHeaderId: number;
  createdAt: string;
  menuItemName: string;
  quantity: number;
  totalPrice: number;
  orderStatus: string;
  kitchenStatus: string;
  note?: string;
}