export interface UpdateManual {
  title?: string;     // เพิ่มใหม่
  content?: string;
  location?: string;   // เพิ่มใหม่
  category?: string;
  targetRole?: string;
  isUsed?: boolean;
  file?: File | null;
}
