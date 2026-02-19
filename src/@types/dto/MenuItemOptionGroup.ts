import type { MenuItemOption } from "./MenuItemOption";

export interface MenuItemOptionGroup {
    menuItemId: number;
    menuItemName: string;

    menuItemOptionId: number;
    sequence: number;

    menuItemOption: MenuItemOption;
}