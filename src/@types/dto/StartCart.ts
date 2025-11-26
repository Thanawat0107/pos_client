export interface StartCart {
    id: number;
    cartToken: string;
    orderTag: string;
    orderStatus: string;
    createdAt: string;
    itemCount: number;
    totalAmount: number;
}