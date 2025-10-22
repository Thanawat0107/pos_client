import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import NotFound from "../components/pages/NotFound";
import MenuItem from "../pages/MenuItem";
import Cart from "../pages/ShoppingCart";
import Profile from "../pages/Profile";
import ManageMenuItem from "../pages/adminPage/ManageMenuItem";
import ManageCategory from "../pages/adminPage/ManageCategory";
import ManageOrder from "../pages/adminPage/ManageOrder";

export default function Routers() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menuItem" element={<MenuItem />} />
      {/* <Route path="/productDetails/:id" element={<ProductDetails />} /> */}
      <Route path="/cart" element={<Cart />} />
      <Route path="/profile" element={<Profile />} />
      {/* <Route path="/checkout" element={<Checkout />} /> */}
      <Route path="/manage-menuItem" element={<ManageMenuItem />} />
      <Route path="/manage-category" element={<ManageCategory />} />
      <Route path="/manage-order" element={<ManageOrder />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
