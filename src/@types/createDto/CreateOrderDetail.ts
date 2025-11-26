import { CreateOrderDetailOption } from "./CreateOrderDetailOption";

export interface CreateOrderDetail {
    menuItemId: number;
    menuItemName: string;
    unitPrice: number;
    quantity: number;
    note: string;

    orderDetailOptions: CreateOrderDetailOption[];
}
