import { useEffect } from "react";
import Footer from "./components/layouts/Footer";
import Navber from "./components/layouts/Navber";
import { useAppDispatch } from "./hooks/useAppHookState";
import Routers from "./routers/Routers";
import { loadAuth } from "./features/auth/loadAuth";
import { signalRService } from "./services/signalrService";

function App() {
   const dispatch = useAppDispatch();

   useEffect(() => {
    const initApp = async () => {
      // รอโหลด Auth ให้เสร็จก่อน
      await dispatch(loadAuth());
      // แล้วค่อยเปิดท่อ SignalR
      signalRService.startConnection();
    };

    initApp();

    return () => {
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
