/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Typography } from "@mui/material";
import { useGetMenuItemsQuery } from "../services/menuItemApi";
import { useGetCategoriesQuery } from "../services/categoriesApi";
import type { MenuItemDto } from "../@types/dto/MenuItem";
import MenuList from "../components/pages/menu/MenuList";

export default function MenuItem() {
  // --- 1. Fetch Data ---
  const {
    data: menuData,
    isLoading: isMenuLoading,
    isError: isMenuError,
  } = useGetMenuItemsQuery({});

  const { data: catData, isLoading: isCatLoading } = useGetCategoriesQuery({});

  // --- 2. Prepare Data ---
  const allItems = menuData?.result ?? [];
  const categories = catData?.result ?? []; // แปลงข้อมูล Categories จาก API
  const isLoading = isMenuLoading || isCatLoading;

  const handleAdd = (m: MenuItemDto) => {
    console.log("add to cart:", m);
  };

  if (isMenuError) {
    return (
      <Box sx={{ textAlign: "center", mt: 10, color: "error.main" }}>
        <Typography variant="h6">
          เกิดข้อผิดพลาด ไม่สามารถโหลดข้อมูลได้
        </Typography>
      </Box>
    );
  }

  // ✅ ส่งข้อมูลดิบ (allItems) ไปให้ MenuList จัดการ Filter เอง
  // ✅ ส่ง categories ที่ดึงมาจาก API ไปให้ทำปุ่มเลือก
  return (
    <MenuList
      items={allItems}
      categories={categories.map((c: any) => ({ id: c.id, name: c.name }))} // Map ให้ตรงกับ Type CategoryOption
      isLoading={isLoading}
      onAddToCart={handleAdd}
      currency="THB"
    />
  );
}