import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MenuCategory } from "../../@types/dto/MenuCategory";

interface CategoriesState {
    items: MenuCategory[];
    loading: boolean;
    error: string | null;
}

const initialState: CategoriesState = {
    items: [],
    loading: false,
    error: null,
};

const categoriesSlice = createSlice({
    name: "categories",
    initialState,
    reducers: {
        setCategories: (state, action: PayloadAction<MenuCategory[]>) => {
            state.items = action.payload;
            state.error = null;
        },
        addCategory: (state, action: PayloadAction<MenuCategory>) => {
            state.items.push(action.payload);
        },
        updateCategory: (state, action: PayloadAction<MenuCategory>) => {
            const index = state.items.findIndex((cat) => cat.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
        deleteCategory: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter((cat) => cat.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const {
    setCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    setLoading,
    setError,
    clearError,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;