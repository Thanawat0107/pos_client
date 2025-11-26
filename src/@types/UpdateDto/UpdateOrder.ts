import { UpdateOrderDetail } from "./UpdateOrderDetail";

export interface UpdateOrder {
    id: number;
    customerName?: string;
    customerNote?: string;
    discount: number;

    orderDetails: UpdateOrderDetail[];
}