import type { MenuOptionDetail } from "./MenuOptionDetail";

export interface MenuItemOption {
    id: number;
    name: string;
    isRequired: boolean;
    isMultiple: boolean;
    isUsed: boolean;
    isDeleted: boolean;

    menuItemId: number;
    MenuItemName: string;

    menuOptionDetails: MenuOptionDetail[];
}