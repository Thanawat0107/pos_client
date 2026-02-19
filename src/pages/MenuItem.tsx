/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Typography, Snackbar, Alert } from "@mui/material";
import { useState } from "react";
import { useGetMenuItemsQuery } from "../services/menuItemApi";
import { useGetCategoriesQuery } from "../services/categoriesApi";
import { useAddtoCartMutation } from "../services/shoppingCartApi";
import { useAppSelector } from "../hooks/useAppHookState";
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
  const categories = catData?.result ?? [];
  const isLoading = isMenuLoading || isCatLoading;

  // --- 3. Cart ---
  const [addtoCart] = useAddtoCartMutation();
  const { userId } = useAppSelector((state) => state.auth);
  const [snackMsg, setSnackMsg] = useState<string | null>(null);

  // ✅ Quick Add: ไม่ส่ง optionIds → backend เลือก IsDefault ให้เอง
  const handleAdd = async (m: MenuItemDto) => {
    const cartToken = localStorage.getItem("cartToken") || undefined;
    try {
      const result = await addtoCart({
        menuItemId: m.id,
        quantity: 1,
        // ไม่ส่ง optionIds → Quick Add path (backend ใช้ IsDefault)
        userId: userId?.toString(),
        cartToken,
      }).unwrap();

      // เก็บ cartToken ที่ได้รับจาก backend (กรณีสร้างใหม่)
      if (result.cartToken && !cartToken) {
        localStorage.setItem("cartToken", result.cartToken);
      }

      setSnackMsg(`เพิ่ม "${m.name}" ลงตะกร้าแล้ว`);
    } catch {
      setSnackMsg(`เกิดข้อผิดพลาด ไม่สามารถเพิ่ม "${m.name}" ได้`);
    }
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
    <>
      <MenuList
        items={allItems}
        categories={categories.map((c: any) => ({ id: c.id, name: c.name }))}
        isLoading={isLoading}
        onAddToCart={handleAdd}
        currency="THB"
      />

      {/* Feedback Snackbar */}
      <Snackbar
        open={!!snackMsg}
        autoHideDuration={2500}
        onClose={() => setSnackMsg(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackMsg(null)}
          severity={snackMsg?.startsWith("เกิด") ? "error" : "success"}
          variant="filled"
          sx={{ width: "100%", borderRadius: 3 }}
        >
          {snackMsg}
        </Alert>
      </Snackbar>
    </>
  );
}