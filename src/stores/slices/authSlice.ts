/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RegisterResponse } from "../../@types/Responsts/RegisterResponse";
import type { SD_Roles } from "../../@types/Enum";
import shoppingCartApi from "../../services/shoppingCartApi";

interface AuthState extends RegisterResponse {
  role: SD_Roles | "";
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  userId: "",
  userName: "",
  email: "",
  phoneNumber: "",
  role: "",
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<RegisterResponse & { token: string }>
    ) => {
      const { userName, email, phoneNumber, role, token, userId } =
        action.payload;
      state.userId = userId;
      state.userName = userName;
      state.email = email;
      state.phoneNumber = phoneNumber;
      state.role = role as SD_Roles;
      state.token = token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.userId = "";
      state.userName = "";
      state.email = "";
      state.phoneNumber = "";
      state.role = "";
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

// ✅ Thunk สำหรับ Logout ที่ช่วยล้าง Cache ของ RTK Query ด้วย
export const logoutAndClear = () => (dispatch: any) => {
  dispatch(logout());
  // 🔔 3. ล้างสถานะ API ทั้งหมด (ตะกร้าจะหายไปจากหน้าจอทันที ไม่ต้องรอยิง API)
  dispatch(shoppingCartApi.util.resetApiState());
};

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;