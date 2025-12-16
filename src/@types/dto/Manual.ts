export interface Manual {
  id: number;
  content: string;
  category: string;
  targetRole: string;
  fileUrl: string;
  createAt: string | Date;
  updateAt: string | Date;
  isUsed: boolean;
  // UserId เพื่อรู้ว่าใครสร้าง (หรือถ้ามี User Object ก็ Map ชื่อมาใส่ได้)
  userId: string;
}
