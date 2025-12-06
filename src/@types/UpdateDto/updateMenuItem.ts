import type { UpdateMenuItemOptionGroup } from "./UpdateMenuItemOptionGroup";

export interface UpdateMenuItem {
  name?: string;
  description?: string;
  basePrice?: number;
  imageUrl?: string;
  isUsed?: boolean;
  imageFile?: File;

  menuCategoryId?: number | null;
  menuItemOptionGroups?: UpdateMenuItemOptionGroup[];
}