import { Box, CircularProgress, Typography } from "@mui/material";
import MenuList from "../components/pages/menu/MenuList";

// ✅ 1. Import DTO และ API Hook
import type { MenuItemDto } from "../@types/dto/MenuItem"; 
import { useGetMenuItemsQuery } from "../services/menuItemApi"; // ตรวจสอบ path ให้ถูกต้อง

export default function MenuItem() {
  // ✅ 2. เรียกข้อมูลจาก API (ไม่ต้องใช้ Mock แล้ว)
  const { data, isLoading, isError } = useGetMenuItemsQuery({});

  const handleAdd = (m: MenuItemDto) => {
    // m ในที่นี้คือข้อมูลสินค้าทั้งก้อนจาก Database
    console.log("add to cart:", m);
  };

  // ✅ 3. แสดง Loading ระหว่างรอข้อมูล
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  // ✅ 4. แสดง Error หากโหลดไม่ได้
  if (isError) {
    return (
      <Box sx={{ textAlign: "center", mt: 10, color: "error.main" }}>
        <Typography variant="h6">เกิดข้อผิดพลาด ไม่สามารถโหลดข้อมูลได้</Typography>
      </Box>
    );
  }

  // ✅ 5. ส่งข้อมูลจริง (data.result) ไปที่ MenuList
  return (
    <>
      <MenuList 
        items={data?.result ?? []} 
        onAddToCart={handleAdd} 
        currency="THB" 
      />
    </>
  );
}