import { CreateOrderDetail } from "./CreateOrderDetail";

export interface CreateOrder {
    orderType: string;
    customerName: string;
    customerNote: string;

    orderDetails: CreateOrderDetail[];
}