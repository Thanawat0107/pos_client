import { CreateMenuItemOptionGroup } from "./CreateMenuItemOptionGroup";

export interface CreateMenuItem {
    name: string;
    description: string;
    basePrice: number;
    imageUrl: string;
    menuRecipe: string;
    imageFile?: File;

    menuCategoryId: number;
    menuItemOptionGroups: CreateMenuItemOptionGroup[];
}