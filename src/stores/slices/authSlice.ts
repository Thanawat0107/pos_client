import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { SD_Roles } from "../../@types/Enum";
import type { RegisterResponse } from "../../@types/Responsts/RegisterResponse";

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

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
