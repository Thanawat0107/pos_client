import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import authApi from "../services/authApi";
import categoriesSlice from "./slices/categoriesSlice";
import { categoriesApi } from "../services/categoriesApi";
import menuItemApi from "../services/menuItemApi";
import { menuItemOptionApi } from "../services/menuItemOptionApi";
import { recipesApi } from "../services/recipesApi";
export const store = configureStore({
  reducer: {
    auth: authSlice,
    categories: categoriesSlice,
    [authApi.reducerPath]: authApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [menuItemApi.reducerPath]: menuItemApi.reducer,
    [menuItemOptionApi.reducerPath]: menuItemOptionApi.reducer,
    [recipesApi.reducerPath]: recipesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      categoriesApi.middleware,
      menuItemApi.middleware,
      menuItemOptionApi.middleware,
      recipesApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
