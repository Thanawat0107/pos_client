export interface Payment {
    id: number;
    paymentMethod: string;
    totalAmount: number;
    paidAt: string;
    isConfirmed: boolean;
    note?: string;
    transactionRef?: string;
}