export interface MenuOptionDetail {
    id: number;
    name: string;
    extraPrice: number;
    isDefault: boolean;
    isUsed: boolean;
    isDeleted: boolean;

    menuItemOptionId: number;
    menuItemOptionName: string;
}