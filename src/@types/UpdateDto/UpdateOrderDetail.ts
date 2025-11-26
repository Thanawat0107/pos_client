import { UpdateOrderDetailOption } from "./UpdateOrderDetailOption";

export interface UpdateOrderDetail {
    id: number;
    menuItemId: number;
    menuItemName: string;
    unitPrice: number;
    quantity: number;
    note?: string;

    orderDetailOptions: UpdateOrderDetailOption[];
}