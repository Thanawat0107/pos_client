import type { CreateMenuItemOptionGroup } from "./CreateMenuItemOptionGroup";

export interface CreateMenuItem {
    name: string;
    description: string;
    basePrice: number;
    imageUrl: string;
    imageFile?: File;

    menuCategoryId: number;
    menuItemOptionGroups: CreateMenuItemOptionGroup[];
}