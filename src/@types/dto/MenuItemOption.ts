import { MenuOptionDetail } from "./MenuOptionDetail";

export interface MenuItemOption {
    id: number;
    name: string;
    isRequired: boolean;
    isMultiple: boolean;
    isUsed: boolean;
    isDeleted: boolean;
    displayOrder: number;

    menuItemId: number;
    MenuItemName: string;

    menuOptionDetails: MenuOptionDetail[];
}