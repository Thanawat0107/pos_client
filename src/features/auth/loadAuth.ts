/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { SD_Roles } from "../../@types/Enum";
import { storage } from "../../helpers/storageHelper";
import { jwtDecode } from "jwt-decode";
import type { RegisterResponse } from "../../@types/Responsts/RegisterResponse";
import type { AppDispatch } from "../../stores/store";
import { logout, setCredentials } from "../../stores/slices/authSlice";

interface DecodedToken extends RegisterResponse {
  exp: number;
  role: SD_Roles;
}

export const loadAuth = () => {
  return async (dispatch: AppDispatch) => {
    try {
      const token = await storage.get("token");
      if (!token) return;

      const decoded = jwtDecode<DecodedToken>(token);

      if (!decoded.exp || decoded.exp * 1000 < Date.now()) {
        await storage.remove("token");
        dispatch(logout());
        window.alert("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
        return;
      }

      dispatch(
        setCredentials({
          userId: decoded.userId,
          userName: decoded.userName,
          email: decoded.email,
          phoneNumber: decoded.phoneNumber,
          role: decoded.role,
          token,
        })
      );
    } catch (error: any) {
      await storage.remove("token");
      dispatch(logout());
    }
  };
};
