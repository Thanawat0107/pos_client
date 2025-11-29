import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import type { RootState } from "../stores/store";

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (!token) {
      // ถ้าอยากให้ redirect ไปหน้า login พร้อมจำ path เดิมก็ใส่ state ไว้
      navigate("/", { replace: true, state: { from: location } });
    }
  }, [token, navigate, location]);
};
