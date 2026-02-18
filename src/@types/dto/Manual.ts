export interface Manual {
  id: number;
  title: string;     // เพิ่มใหม่
  content?: string;
  location?: string;  // เพิ่มใหม่ (Optional)
  category: string;
  targetRole: string;
  fileUrl: string;
  createAt: string;
  updateAt: string;
  isUsed: boolean;
  userId: string;
}
