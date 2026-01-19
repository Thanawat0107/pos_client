export interface CartItemOption {
  id: number; // PK ของตาราง CartItemOption (เอาไว้เผื่อลบเฉพาะ option นี้)

  // ✅ ID ต้นทาง (สำคัญมากสำหรับ Frontend ใช้ Re-select)
  menuItemOptionId: number; // (OptionGroupId เดิม)
  menuOptionDetailId?: number | null; // (OptionValueId เดิม)

  // ✅ ชื่อสำหรับแสดงผล
  optionGroupName: string; // เช่น "ความหวาน"
  optionValueName: string; // เช่น "หวานน้อย"

  // ✅ Helper สำหรับแสดงผลรวม
  displayName: string; // เช่น "ความหวาน: หวานน้อย (+0 บาท)"

  // ✅ ราคา
  extraPrice: number;
}