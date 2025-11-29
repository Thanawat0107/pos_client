import { useEffect } from "react";
import Footer from "./components/layouts/Footer";
import Navber from "./components/layouts/Navber";
import { useAppDispatch } from "./hooks/useAppHookState";
import Routers from "./routers/Routers";
import { loadAuth } from "./features/auth/loadAuth";

function App() {
   const dispatch = useAppDispatch();

   useEffect(() => {
     dispatch(loadAuth());
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
