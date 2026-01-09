import { Box, Typography } from "@mui/material";
import MenuList from "../components/pages/menu/MenuList";
import type { MenuItemDto } from "../@types/dto/MenuItem"; 
import { useGetMenuItemsQuery } from "../services/menuItemApi";

export default function MenuItem() {
  const { data, isLoading, isError } = useGetMenuItemsQuery({});

  const handleAdd = (m: MenuItemDto) => {
    console.log("add to cart:", m);
  };

  // ❌ ลบ Loading แบบหมุนๆ ออก เพื่อไปใช้ Skeleton ใน MenuList แทน
  // if (isLoading) return <CircularProgress ... />;

  // ⚠️ ส่วน Error ยังคงไว้ได้ หรือจะส่ง error state ไปจัดการข้างในก็ได้
  if (isError) {
    return (
      <Box sx={{ textAlign: "center", mt: 10, color: "error.main" }}>
        <Typography variant="h6">เกิดข้อผิดพลาด ไม่สามารถโหลดข้อมูลได้</Typography>
      </Box>
    );
  }

  return (
    <MenuList 
      items={data?.result ?? []} 
      isLoading={isLoading} // ✅ ส่ง isLoading เข้าไป เพื่อโชว์ Skeleton สวยๆ
      onAddToCart={handleAdd} 
      currency="THB"
    />
  );
}