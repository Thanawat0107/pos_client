export interface UpdateRecipe {
    menuItemId?: number;
    // ส่ง JSON object สำหรับ ingredients
    ingredients?: Record<string, unknown>;
    instructions?: string;
    isUsed?: boolean;
}