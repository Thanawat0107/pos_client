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
import MenuDetails from "../components/pages/menu/MenuDetails";
import Checkout from "../pages/checkout/Checkout";
import OrderSuccess from "../pages/orderSuccess/OrderSuccess";
import ActiveOrderFloating from "../pages/activeOrder/ActiveOrderFloating";
import MyOrders from "../pages/order/MyOrders";
import Dashboard from "../components/pages/adminManage/dashboard/Dashboard";
import CustomerManual from "../pages/CustomerManual";

export default function Routers() {
  return (
    <>
      {/* ใส่ไว้ตรงนี้! เพื่อให้ลอยอยู่เหนือทุกหน้า */}
      <ActiveOrderFloating />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menuItem" element={<MenuItem />} />
        <Route path="/menu/:id" element={<MenuDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/customer-manual" element={<CustomerManual />} />
        <Route path="/order-success/:id" element={<OrderSuccess />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/manage-menuItem" element={<ManageMenuItem />} />
        <Route path="/manage-manual" element={<ManageManualList />} />
        <Route
          path="/manage-menuItemOption"
          element={<ManageMenuItemOptionList />}
        />
        <Route path="/manage-recipe" element={<ManageRecipeList />} />
        <Route path="/manage-content" element={<ManageContentList />} />
        <Route path="/manage-category" element={<ManageCategory />} />
        <Route path="/manage-order" element={<ManageOrder />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
