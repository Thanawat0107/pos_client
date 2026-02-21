export interface Manual {
  id: number;
  title: string;
  content?: string;
  location?: string;
  category: string;
  targetRole: string;
  images: string[];
  createAt: string;
  updateAt: string;
  isUsed: boolean;
  userId: string;
}
