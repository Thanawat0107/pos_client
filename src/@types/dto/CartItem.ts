import type { CartItemOption } from "./CartItemOption";

export interface CartItem {
  id: number;

  menuItemId: number;
  menuItemName: string;
  menuItemImage?: string | null; // เผื่อโชว์รูปเล็กๆ ในตะกร้า

  quantity: number;

  // 💸 ราคารวมต่อหน่วย (ราคาอาหาร + ราคา Option เสริมแล้ว)
  // เช่น ข้าว 50 + ไข่ดาว 10 = 60 บาท
  price: number;

  // หมายเหตุ (เช่น "ไม่ใส่ผัก")
  note?: string | null;

  // รายการตัวเลือกเสริม (Toppings/Options)
  options: CartItemOption[];
}