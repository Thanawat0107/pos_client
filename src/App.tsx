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

  // 1. โหลดข้อมูล Auth ครั้งแรกที่เปิดเว็บ
  useEffect(() => {
    dispatch(loadAuth());
  }, [dispatch]);

  // 2. จัดการ SignalR Lifecycle ตามการเปลี่ยนแปลงของ Token
  useEffect(() => {
    const syncSignalR = async () => {
      // หยุดตัวเก่าก่อนเสมอ
      await signalRService.stopConnection();

      // เริ่มตัวใหม่
      signalRService.startConnection();

      signalRService.on("NewOrderReceived", (newOrder) => {
        // toast.success(`🔔 มีออเดอร์ใหม่! หมายเลข: ${newOrder.orderCode}`);
        // สั่งให้โหลดข้อมูลออเดอร์ใหม่ในหน้า Dashboard
        dispatch(orderApi.util.invalidateTags(["Order"]));
      });

      // 🔔 ลงทะเบียน Listeners หลังจากเริ่ม Connection
      signalRService.on("CartUpdated", (updatedCart) => {
        const currentToken = localStorage.getItem("cartToken");

        // 🚩 ถ้าไม่มี cartToken หรือเป็น Admin/Employee อาจไม่จำเป็นต้องอัปเดตตะกร้า
        if (!currentToken) return;

        dispatch(
          shoppingCartApi.util.updateQueryData(
            "getCart",
            currentToken,
            (draft) => {
              if (draft) {
                Object.assign(draft, updatedCart);
              }
            },
          ),
        );
      });
      signalRService.on("CartCleared", () => {
        const currentToken = localStorage.getItem("cartToken");
        dispatch(
          shoppingCartApi.util.updateQueryData(
            "getCart",
            currentToken,
            (draft) => {
              draft.cartItems = [];
              draft.totalAmount = 0;
              draft.totalItemsCount = 0;
            },
          ),
        );
      });
    };

    syncSignalR();

    // 🧹 Cleanup Function: สำคัญมาก!
    return () => {
      console.log("Cleaning up SignalR...");
      signalRService.off("CartUpdated");
      signalRService.off("CartCleared");
      signalRService.stopConnection();
    };
  }, [token, dispatch]); // เมื่อ token เปลี่ยน จะรัน cleanup ตัวเก่า และเริ่ม sync ตัวใหม่

  return (
    <>
      <Navber />
      <Routers />
      <Footer />
    </>
  );
}

export default App;