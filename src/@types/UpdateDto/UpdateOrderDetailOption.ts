export interface UpdateOrderDetailsOption{
  id: number;          // ⭐ จำเป็น: เพื่อบอกว่าจะแก้ Option แถวไหน
  quantity?: number;   // ส่งมาเมื่อมีการแก้จำนวน
}