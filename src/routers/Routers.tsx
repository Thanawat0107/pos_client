import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import NotFound from "../components/pages/NotFound";
import MenuItem from "../pages/MenuItem";
import Cart from "../pages/Cart";
import Profile from "../pages/Profile";

export default function Routers() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menuItem" element={<MenuItem />} />
      {/* <Route path="/productDetails/:id" element={<ProductDetails />} /> */}
      <Route path="/cart" element={<Cart />} />
      <Route path="/profile" element={<Profile />} />
      {/* <Route path="/checkout" element={<Checkout />} /> */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
