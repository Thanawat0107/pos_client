import { useState } from "react";
import Carousel from "../components/layouts/Carousel";
import CategoryScroller, {
  demoCategories,
} from "../components/pages/category/CategoryScroller";
import { Typography, Box, CircularProgress } from "@mui/material";
import MenuScroller from "../components/pages/menu/MenuScroller";

// ✅ Import DTO
import type { MenuItemDto } from "../@types/dto/MenuItem"; 
import { useGetMenuItemsQuery } from "../services/menuItemApi"; // หรือ path ที่ถูกต้องของคุณ

export default function Home() {
  const [cat, setCat] = useState<string>("pizza");

  // เรียก API
  const { data, isLoading, isError } = useGetMenuItemsQuery({});

  // ✅ ไม่ต้องใช้ useMemo แปลงข้อมูลแล้ว เพราะ MenuCard ฉบับใหม่รับ MenuItemDto ได้เลย
  // แค่กัน error กรณี data ยังไม่มา ให้เป็น array ว่าง []
  const menuItems: MenuItemDto[] = data?.result ?? [];

  return (
    <>
      <div style={{ margin: "10px" }}>
        <Carousel />
      </div>
      
      <CategoryScroller
        items={demoCategories}
        value={cat}
        onChange={setCat}
        maxWidth="xl"
      />

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h6">Selected Category: {cat}</Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Box sx={{ textAlign: "center", mt: 10, color: "error.main" }}>
          <Typography variant="h6">เกิดข้อผิดพลาดในการโหลดข้อมูล</Typography>
        </Box>
      ) : (
        <MenuScroller
          items={menuItems} // ✅ ส่ง MenuItemDto[] เข้าไปตรงๆ
          currency="THB"
          onAddToCart={(product) => {
            console.log("Add to cart (DTO):", product);
            // product ในที่นี้คือ MenuItemDto เต็มๆ
          }}
          maxWidth="xl"
        />
      )}
    </>
  );
}