export interface OrderDetailsOption {
  id: number;
  optionGroupName: string; // เช่น "ระดับความเผ็ด"
  optionValueName: string; // เช่น "เผ็ดกลาง"
  extraPrice: number;
  quantity: number;
}