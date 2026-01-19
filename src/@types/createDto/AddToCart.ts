export interface AddToCart {
  // --- ข้อมูลสินค้า ---
  menuItemId: number;
  quantity: number;
  optionIds?: number[] | null;

  // ✅ เพิ่ม: หมายเหตุรายตัว (เช่น ไม่ใส่ผัก, เผ็ดน้อย)
  note?: string | null;

  // --- ข้อมูลระบุตัวตน ---
  userId?: string | null;
  cartToken?: string | null;
}