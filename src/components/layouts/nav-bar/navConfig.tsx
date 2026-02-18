import * as React from "react";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AnnouncementOutlinedIcon from "@mui/icons-material/AnnouncementOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";

// กำหนดโครงสร้างข้อมูลให้ชัดเจน
export interface NavItem {
  text: string;
  path: string;
  icon?: React.ReactNode; // ใส่หรือไม่ใส่ก็ได้
}

// 1. เมนูหลักสำหรับผู้ใช้ทั่วไป
export const MAIN_NAV: NavItem[] = [
  {
    text: "หน้าแรก",
    path: "/",
    icon: <HomeOutlinedIcon />,
  },
  {
    text: "เมนูอาหาร",
    path: "/menuItem",
    icon: <RestaurantMenuOutlinedIcon />,
  },
  {
    text: "ออเดอร์ของฉัน",
    path: "/my-orders",
    icon: <ReceiptLongOutlinedIcon />,
  },
  {
    text: "จุดบริการตนเอง",
    path: "/customer-manual",
    icon: <MenuBookOutlinedIcon />,
  },
];

// 2. เมนูสำหรับ Admin เท่านั้น
export const ADMIN_NAV: NavItem[] = [
  {
    text: "จัดการเมนู",
    path: "/manage-menuItem",
    icon: <RestaurantMenuOutlinedIcon fontSize="small" />,
  },
  {
    text: "จัดการหมวดหมู่",
    path: "/manage-category",
    icon: <CategoryOutlinedIcon fontSize="small" />,
  },
  {
    text: "จัดการออเดอร์",
    path: "/manage-order",
    icon: <ReceiptLongOutlinedIcon fontSize="small" />,
  },
  {
    text: "จัดการคู่มือ",
    path: "/manage-manual",
    icon: <Inventory2OutlinedIcon fontSize="small" />,
  },
  {
    text: "จัดการข่าวสาร",
    path: "/manage-content",
    icon: <AnnouncementOutlinedIcon fontSize="small" />,
  },
  {
    text: "แดชบอร์ด",
    path: "dashboard",
    icon: <DashboardOutlinedIcon fontSize="small" />,
  },
];
