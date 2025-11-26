import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Alert } from "react-native";
import { useAppDispatch, useAppSelector } from "./useAppHookState";
import { storage } from "../helpers/storageHelper";
import { logout } from "../stores/slices/authSlice";
import { useAppNavigation } from "./useAppNavigation";

interface DecodedToken {
  exp: number;
  userId: string;
  userName: string;
}

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigation = useAppNavigation();
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        navigation.navigate("Home" as never);
        return;
      }
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        if (!decoded.exp || decoded.exp * 1000 < Date.now()) {
          await storage.remove("token");
          dispatch(logout());
          Alert.alert("Session หมดอายุ", "กรุณาเข้าสู่ระบบใหม่อีกครั้ง", [
            {
              text: "ตกลง",
              onPress: () => navigation.replace("Home" as any),
            },
          ]);
        }
      } catch {
        await storage.remove("token");
        dispatch(logout());
        navigation.navigate("Home" as never);
      }
    };
    verifyToken();
  }, [token, dispatch, navigation]);
};
