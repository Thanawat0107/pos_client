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

  useEffect(() => {
    dispatch(loadAuth());
  }, [dispatch]);

  useEffect(() => {
    const syncSignalR = async () => {

      await signalRService.startConnection();

      // ลงทะเบียน Listeners
      signalRService.on("NewOrderReceived", (_newOrder) => {
        dispatch(orderApi.util.invalidateTags(["Order"]));
        dispatch(dashboardApi.util.invalidateTags(["Dashboard"]));
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