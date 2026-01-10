import { Route, Routes } from "react-router-dom";
import Home from "../pages/home/Home";
import NotFound from "../components/pages/NotFound";
import MenuItem from "../pages/MenuItem";
import Cart from "../pages/ShoppingCart";
import ManageMenuItem from "../pages/adminPage/ManageMenuItem";
import ManageCategory from "../pages/adminPage/ManageCategory";
import ManageOrder from "../pages/adminPage/ManageOrder";
import Login from "../components/pages/profile/Login";
import Register from "../components/pages/profile/Register";
import ManageMenuItemOptionList from "../components/pages/adminManage/menuItemOption/ManageMenuItemOptionList";
import ManageRecipeList from "../components/pages/adminManage/recipe/ManageRecipeList";
import ManageManualList from "../components/pages/adminManage/manual/ManageManualList";
import ManageContentList from "../components/pages/adminManage/content/ManageContentList";

export default function Routers() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/menuItem" element={<MenuItem />} />
      {/* <Route path="/productDetails/:id" element={<ProductDetails />} /> */}
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* <Route path="/checkout" element={<Checkout />} /> */}
      <Route path="/manage-menuItem" element={<ManageMenuItem />} />
      <Route path="/manage-manual" element={<ManageManualList />} />
      <Route path="/manage-menuItemOption" element={<ManageMenuItemOptionList />} />
      <Route path="/manage-recipe" element={<ManageRecipeList />} />
      <Route path="/manage-content" element={<ManageContentList />} />
      <Route path="/manage-category" element={<ManageCategory />} />
      <Route path="/manage-order" element={<ManageOrder />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
