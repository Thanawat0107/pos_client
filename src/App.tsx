import { useEffect } from "react";
import Footer from "./components/layouts/Footer";
import Navber from "./components/layouts/Navber";
import { useAppDispatch } from "./hooks/useAppHookState";
import Routers from "./routers/Routers";
import { loadAuth } from "./features/auth/loadAuth";
import { signalRService } from "./services/signalrService";
import shoppingCartApi from "./services/shoppingCartApi";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initApp = async () => {
      // 1. โหลด Auth (เพื่อให้ JWT Token ถูกเก็บใน LocalStorage)
      await dispatch(loadAuth());

      // 2. เริ่มเชื่อมต่อ SignalR
      signalRService.startConnection();

      // 3. 🔔 ดักฟังเหตุการณ์ CartUpdated
      signalRService.on("CartUpdated", (updatedCart) => {
        // อัปเดต Cache ของ RTK Query (Endpoint: getCart)
        // ต้องระบุ argument (cartToken) ให้ตรงกับตอนที่เรียกใช้ useGetCartQuery(token)
        const currentToken = localStorage.getItem("cartToken");
        
        dispatch(
          shoppingCartApi.util.updateQueryData("getCart", currentToken, (draft) => {
            // ปรับปรุงข้อมูลในตะกร้าด้วยข้อมูลใหม่ที่ส่งมาจาก Server
            Object.assign(draft, updatedCart);
          })
        );
      });

      // 4. 🔔 ดักฟังเหตุการณ์ CartCleared
      signalRService.on("CartCleared", () => {
        const currentToken = localStorage.getItem("cartToken");
        dispatch(
          shoppingCartApi.util.updateQueryData("getCart", currentToken, (draft) => {
             // เคลียร์ข้อมูลในตะกร้า (ตามโครงสร้าง Cart DTO ของคุณ)
             draft.cartItems = [];
             draft.totalAmount = 0;
             draft.totalItemsCount = 0;
          })
        );
      });
    };

    initApp();

    return () => {
      // ปิด listener และ connection เมื่อปิด App
      signalRService.off("CartUpdated");
      signalRService.off("CartCleared");
      signalRService.stopConnection();
    };
  }, [dispatch]);

  return (
    <>
      <Navber />
      <Routers />
      <Footer />
    </>
  );
}

export default App;
