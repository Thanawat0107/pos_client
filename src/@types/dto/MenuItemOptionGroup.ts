import { MenuItemOption } from "./MenuItemOption";

export interface MenuItemOptionGroup {
    id: number;
    
    menuItemId: number;
    menuItemName: string;

    menuItemOptionId: number;
    menuItemOptionName: string;

    displayOrder: number;

    menuItemOption: MenuItemOption;
}