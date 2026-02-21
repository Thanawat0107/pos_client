export interface CreateManual {
  title: string;      // เพิ่มใหม่
  content?: string;
  location?: string;   // เพิ่มใหม่
  category: string;
  targetRole: string;
  newImages?: File[] | null;
}
