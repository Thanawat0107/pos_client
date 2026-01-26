export interface ConfirmCartRequest {
    cartToken: string;
    guestToken?: string;    // เพิ่มให้ตรงกับ Payload
    customerName: string;   // เพิ่มให้ตรงกับ Payload
    customerPhone: string;  // เพิ่มให้ตรงกับ Payload
    customerNote?: string;
    promoCode?: string;
    paymentMethod: string;
    userId?: number;
}