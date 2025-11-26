export interface AddToCart {
    menuItemId: number;
    quantity: number;
    optionIds?: number[];
    userId?: string;
    cartToken: string;
    isSplit: boolean;
} 