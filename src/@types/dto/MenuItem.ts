import { MenuItemOptionGroup } from "./MenuItemOptionGroup";

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  imageUrl?: string;
  menuRecipe: string;
  createdAt: string;
  updatedAt: string;
  isUsed: boolean;
  isDeleted: boolean;

  menuCategoryId?: number | null;
  menuCategoryName?: string | null;

  menuItemOptionGroups: MenuItemOptionGroup[];
}