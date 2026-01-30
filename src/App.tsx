import { useEffect } from "react";
import Footer from "./components/layouts/Footer";
import Navber from "./components/layouts/Navber";
import { useAppDispatch, useAppSelector } from "./hooks/useAppHookState";
import Routers from "./routers/Routers";
import { loadAuth } from "./features/auth/loadAuth";
import { signalRService } from "./services/signalrService";
import shoppingCartApi from "./services/shoppingCartApi";
import { orderApi } from "./services/orderApi";

function App() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  // 1. โหลดข้อมูล Auth (เหมือนเดิม)
  useEffect(() => {
    dispatch(loadAuth());
  }, [dispatch]);

  // 2. จัดการ SignalR (แก้ตรงนี้!)
  useEffect(() => {
    const syncSignalR = async () => {
      // ❌ ลบ: ไม่ต้องสั่ง stop ก่อน เพราะใน startConnection ของ Service เราเขียนดักไว้แล้ว
      // await signalRService.stopConnection(); 

      // ✅ สั่ง Start เลย (Service จะเช็คเองว่าต้อง Restart หรือไม่)
      await signalRService.startConnection();

      // ลงทะเบียน Listeners
      signalRService.on("NewOrderReceived", (newOrder) => {
        // toast.success(...)
        dispatch(orderApi.util.invalidateTags(["Order"]));
      });

      signalRService.on("CartUpdated", (updatedCart) => {
        const currentToken = localStorage.getItem("cartToken");
        if (!currentToken) return;

        dispatch(
          shoppingCartApi.util.updateQueryData(
            "getCart",
            currentToken,
            (draft) => {
              if (draft) Object.assign(draft, updatedCart);
            }
          )
        );
      });

      signalRService.on("CartCleared", () => {
        const currentToken = localStorage.getItem("cartToken");
        if (!currentToken) return; // เพิ่มเช็คกัน Error
        
        dispatch(
          shoppingCartApi.util.updateQueryData(
            "getCart",
            currentToken,
            (draft) => {
              if (draft) {
                  draft.cartItems = [];
                  draft.totalAmount = 0;
                  draft.totalItemsCount = 0;
              }
            }
          )
        );
      });
    };

    syncSignalR();

    // 🧹 Cleanup Function: แก้ไขสำคัญ!
    return () => {
      // ❌ ลบ: อย่าสั่ง stopConnection() ใน Cleanup
      // เพราะถ้าแค่ Re-render หรือ Strict Mode ทำงาน มันจะไปตัดการเชื่อมต่อทิ้ง
      // signalRService.stopConnection(); 

      // ✅ ทำแค่ถอด Event Listener ออกก็พอ
      console.log("Cleaning up SignalR listeners...");
      signalRService.off("NewOrderReceived"); // อย่าลืมถอดอันนี้ด้วย
      signalRService.off("CartUpdated");
      signalRService.off("CartCleared");
    };
  }, [token, dispatch]); 

  return (
    <>
      <Navber />
      <Routers />
      <Footer />
    </>
  );
}

export default App;