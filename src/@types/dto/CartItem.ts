import { CartItemOption } from "./CartItemOption";

export interface CartItem {
    id: number;

    menuItemId: number;
    menuItemName: string;
    menuItemImage: string;

    quantity: number;
    price: number;

    baseTotal: number;
    extraTotal: number;
    total: number;

    note?: string;

    options: CartItemOption[];
}