import type { MenuItemOption } from "./MenuItemOption";

export interface MenuItemOptionGroup {
    id: number;

    menuItemId: number;
    menuItemName: string;

    menuItemOptionId: number;
    menuItemOptionName: string;

    menuItemOption: MenuItemOption;
}