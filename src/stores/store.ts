import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import authApi from "../services/authApi";import categoriesSlice from "./slices/categoriesSlice";
import { categoriesApi } from "../services/categoriesApi";
;

export const store = configureStore({
  reducer: {
    auth: authSlice,
    categories: categoriesSlice,
    [authApi.reducerPath]: authApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      categoriesApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
