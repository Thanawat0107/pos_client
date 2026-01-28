export interface CreateOrder {
  channel: string;             // เช่น 'PickUp'

  customerPhone: string;
  customerName?: string;
  customerNote?: string;

  userId?: string;
  guestToken?: string;
  cartToken: string;           // ⭐ สำคัญมาก

  promoCode?: string;

  // DateTime? -> string (ISO 8601 Format) | undefined
  estimatedPickUpTime?: string; 
}