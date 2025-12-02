import type { UpdateMenuItemOptionGroup } from "./UpdateMenuItemOptionGroup";

export interface UpdateMenuItem {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  isUsed: boolean;
  imageFile?: File;

  menuCategoryId: number;
  menuItemOptionGroups: UpdateMenuItemOptionGroup[];
}