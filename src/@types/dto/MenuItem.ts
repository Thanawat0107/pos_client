import type { MenuItemOptionGroup } from "./MenuItemOptionGroup";

export interface MenuItemDto {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  isUsed: boolean;
  isDeleted: boolean;

  menuCategoryId?: number | null;
  menuCategoryName?: string | null;

  menuItemOptionGroups: MenuItemOptionGroup[];
}