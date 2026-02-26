/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from "react";
import Footer from "./components/layouts/Footer";
import Navber from "./components/layouts/Navber";
import { useAppDispatch, useAppSelector } from "./hooks/useAppHookState";
import Routers from "./routers/Routers";
import { loadAuth } from "./features/auth/loadAuth";
import { signalRService } from "./services/signalrService";
import shoppingCartApi from "./services/shoppingCartApi";
import { orderApi } from "./services/orderApi";
import { dashboardApi } from "./services/dashboardApi";

function App() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const userId = useAppSelector((state) => state.auth.userId);

  useEffect(() => {
    dispatch(loadAuth());
  }, [dispatch]);

  useEffect(() => {
    const syncSignalR = async () => {

      await signalRService.startConnection();

      // 🔥 [เพิ่มใหม่] ถ้าผู้ใช้ Login แล้ว ให้ join User Group
      if (userId && token) {
        try {
          await signalRService.joinUserGroup(`User_${userId}`);
        } catch (err) {
          console.warn("Failed to join user group:", err);
        }
      }

      // ลงทะเบียน Listeners
      signalRService.on("NewOrderReceived", (_newOrder) => {
        dispatch(orderApi.util.invalidateTags(["Order"]));
        dispatch(dashboardApi.util.invalidateTags(["Dashboard"]));
      });

      // 🔥 [เพิ่มใหม่] ฟังการอัปเดตออเดอร์ทั่วไป
      signalRService.on("OrderUpdated", () => {
        dispatch(orderApi.util.invalidateTags(["Order"]));
      });

      // 🔥 [เพิ่มใหม่] ฟังการอัปเดตสถานะออเดอร์ (ลูกค้า)
      signalRService.on("OrderStatusUpdated", () => {
        dispatch(orderApi.util.invalidateTags(["Order"]));
      });

      // 🔥 [เพิ่มใหม่] ฟังการอัปเดตรายละเอียดออเดอร์
      signalRService.on("OrderDetailUpdated", () => {
        dispatch(orderApi.util.invalidateTags(["Order"]));
      });

      // 🔥 [เพิ่มใหม่] ฟังการอัปเดตลิสต์พนักงาน
      signalRService.on("UpdateEmployeeOrderList", () => {
        dispatch(orderApi.util.invalidateTags(["Order"]));
        dispatch(dashboardApi.util.invalidateTags(["Dashboard"]));
      });

      // 🔥 [เพิ่มใหม่] ฟังการลบออเดอร์
      signalRService.on("OrderDeleted", () => {
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
        if (!currentToken) return;
        
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

    return () => {

      console.log("Cleaning up SignalR listeners...");
      signalRService.off("NewOrderReceived");
      signalRService.off("OrderUpdated");
      signalRService.off("OrderStatusUpdated");
      signalRService.off("OrderDetailUpdated");
      signalRService.off("UpdateEmployeeOrderList");
      signalRService.off("OrderDeleted");
      signalRService.off("CartUpdated");
      signalRService.off("CartCleared");
    };
  }, [token, userId, dispatch]); 

  return (
    <>
      <Navber />
      <Routers />
      <Footer />
    </>
  );
}

export default App;