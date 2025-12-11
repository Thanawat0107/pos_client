export interface Recipe {
    id: number;
    menuItemId: number;
    menuItemName: string;
    ingredients: object;
    instructions: string;
    version: number;
    createdAt: Date;
    isUsed: boolean;
}