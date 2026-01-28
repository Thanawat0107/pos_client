import type { OrderDetailsOption } from "./OrderDetailsOption";

export interface OrderDetails {
  id: number;
  menuItemId: number;
  menuItemName: string;
  menuItemImage: string;

  unitPrice: number;      // C# decimal -> TS number
  quantity: number;
  extraPrice: number;     // C# decimal -> TS number
  totalPrice: number;     // C# decimal -> TS number
  note?: string;          // Nullable (?)

  // --- สถานะสำหรับ KDS และ Tracking ---
  // แนะนำ: ถ้าค่า KitchenStatus มีจำกัด (Fixed) ให้เปลี่ยน string เป็น Union Type
  // เช่น: kitchenStatus: 'WAITING' | 'COOKING' | 'DONE' | 'CANCELLED';
  kitchenStatus: string; 
  queueNo?: string;
  isReady: boolean;
  readyAt?: string;       // C# DateTime ส่งมาเป็น ISO String

  // --- สถานะการยกเลิก/คืนเงิน ---
  isCancelled: boolean;
  isRefunded: boolean;
  cancelledAt?: string;   // C# DateTime? -> TS string | undefined

  // รายการตัวเลือกย่อย
  orderDetailOptions: OrderDetailsOption[];
}