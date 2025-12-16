export interface UpdateManual {
  content?: string | null;
  category?: string | null;
  targetRole?: string | null;
  fileUrl?: string | null;
  isUsed?: boolean | null;
  file?: File | null;
  // UpdateAt จะไป Set วันที่ปัจจุบันใน Controller หรือ AutoMapper
}
