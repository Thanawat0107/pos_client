export type PaginationMeta = {
  totalCount: number;   // จำนวนรายการทั้งหมด
  pageNumber: number;   // หน้าปัจจุบัน (เริ่มจาก 1)
  pageSize: number;     // จำนวนรายการต่อหน้า
  pageCount: number;    // จำนวนหน้าทั้งหมด
};