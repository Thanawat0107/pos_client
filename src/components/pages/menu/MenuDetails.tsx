import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  CircularProgress,
  alpha,
  Alert,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert as MuiAlert,
  Container,
  Fade,
} from "@mui/material";
import { useGetMenuItemByIdQuery } from "../../../services/menuItemApi";
import { useAddtoCartMutation } from "../../../services/shoppingCartApi";
import { useAppSelector } from "../../../hooks/useAppHookState";
import type { AddToCart } from "../../../@types/createDto/AddToCart";
import MenuHeroImage from "./MenuHeroImage";
import MenuOptionGroup from "./MenuOptionGroup";
import MenuNoteField from "./MenuNoteField";
import MenuPriceSummary from "./MenuPriceSummary";
import MenuBottomBar from "./MenuBottomBar";

export default function MenuDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // 1. ดึงข้อมูล User จาก Global State (สมมติว่าชื่อ auth slice)
  const { userId } = useAppSelector((state) => state.auth);

  // --- API Hooks ---
  const { data: menu, isLoading, error } = useGetMenuItemByIdQuery(Number(id), {
    skip: !id,
  });

  const [addToCart, { isLoading: isAdding }] = useAddtoCartMutation();

  // --- Local State ---
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number[]>>({});

  // ✅ Pre-select ค่า IsDefault เมื่อโหลดเมนูเสร็จ (ให้ตรงกับ Quick Add ของ Backend)
  useEffect(() => {
    if (!menu) return;
    const defaults: Record<number, number[]> = {};
    menu.menuItemOptionGroups.forEach((group) => {
      const opt = group.menuItemOption;
      const defaultIds = opt.menuOptionDetails
        .filter((d) => d.isDefault && !d.isDeleted && d.isUsed)
        .map((d) => d.id);
      if (defaultIds.length > 0) {
        defaults[opt.id] = defaultIds;
      }
    });
    setSelectedOptions(defaults);
  }, [menu]);
  const [note, setNote] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // --- Logic ---
  const handleToggleOption = (
    optionId: number,
    detailId: number,
    isMultiple: boolean
  ) => {
    setSelectedOptions((prev) => {
      const current = prev[optionId] || [];
      if (isMultiple) {
        return {
          ...prev,
          [optionId]: current.includes(detailId)
            ? current.filter((i) => i !== detailId)
            : [...current, detailId],
        };
      }
      return { ...prev, [optionId]: [detailId] };
    });
  };

  const totalPrice = useMemo(() => {
    if (!menu) return 0;
    let extra = 0;
    menu.menuItemOptionGroups.forEach((group) => {
      const selections = selectedOptions[group.menuItemOption.id] || [];
      selections.forEach((detailId) => {
        const detail = group.menuItemOption.menuOptionDetails.find(
          (d) => d.id === detailId
        );
        if (detail) extra += detail.extraPrice;
      });
    });
    return (menu.basePrice + extra) * quantity;
  }, [menu, selectedOptions, quantity]);

  const isFormValid = useMemo(() => {
    if (!menu) return false;
    return menu.menuItemOptionGroups.every((group) => {
      if (!group.menuItemOption.isRequired) return true;
      return (selectedOptions[group.menuItemOption.id]?.length || 0) > 0;
    });
  }, [menu, selectedOptions]);

  const handleAddToCart = async () => {
    if (!menu || !isFormValid) return;

    // ดึงค่าที่มีอยู่ในปัจจุบัน
    const cartToken = localStorage.getItem("cartToken") || undefined;
    const user = userId?.toString();

    // แปลง selectedOptions เป็น Flat Array
    const selectedOptionIds = Object.values(selectedOptions).flat();

    // เตรียม Payload ให้ตรงตาม interface AddToCart
    const payload: AddToCart = {
      menuItemId: menu.id,
      quantity: quantity,
      optionIds: selectedOptionIds.length > 0 ? selectedOptionIds : undefined,
      note: note.trim() || undefined,
      userId: user,     // ส่ง userId จาก state
      cartToken: cartToken, // ส่ง cartToken จาก localStorage
    };

    try {
      // เรียก Mutation และรับ Response กลับมา
      const result = await addToCart(payload).unwrap();

      // ✅ สำคัญ: ถ้าเป็นการเพิ่มของชิ้นแรกและ Backend สร้าง cartToken ให้ใหม่
      // ต้องเก็บลง localStorage เพื่อใช้ใน Request ถัดไป
      if (result.cartToken && !cartToken) {
        localStorage.setItem("cartToken", result.cartToken);
      }

      setShowSuccess(true);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert("เกิดข้อผิดพลาดในการเพิ่มสินค้า");
    }
  };

  // --- Render ---
  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <CircularProgress color="primary" thickness={4} size={48} />
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            กำลังโหลดเมนู...
          </Typography>
        </div>
      </div>
    );

  if (error || !menu)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
        <div className="text-6xl">🍽️</div>
        <Alert severity="error" variant="filled" sx={{ borderRadius: 4, width: "100%", maxWidth: 400 }}>
          ไม่พบข้อมูลเมนู หรือเกิดข้อผิดพลาด
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ borderRadius: 3, px: 4 }}>
          กลับหน้าเมนู
        </Button>
      </div>
    );

  return (
    <Fade in={!isLoading}>
      <div
        style={{
          backgroundColor: theme.palette.background.default,
          minHeight: "100vh",
          paddingBottom: isMobile ? "9rem" : "3rem",
        }}
      >
        {/* Hero รูปอาหาร */}
        <MenuHeroImage
          imageUrl={menu.imageUrl}
          name={menu.name}
          categoryName={menu.menuCategoryName}
          onBack={() => navigate(-1)}
        />

        {/* Content sheet */}
        <div
          className="relative"
          style={{
            marginTop: isMobile ? -28 : 0,
            borderRadius: isMobile ? "28px 28px 0 0" : 0,
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Container
            maxWidth="lg"
            sx={{ pt: { xs: 5, md: 8 } }}
            style={{ paddingLeft: isMobile ? 24 : 64, paddingRight: isMobile ? 24 : 64 }}
          >
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? undefined : "flex-start", gap: "3rem" }}>

              {/* ── ซ้าย: รายละเอียด + ตัวเลือก ── */}
              <div style={{ width: isMobile ? "100%" : undefined, flex: isMobile ? undefined : 1, minWidth: 0 }}>

                {/* ชื่อ + ราคา */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1.25rem", marginBottom: "2rem" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant={isMobile ? "h4" : "h3"}
                      fontWeight={900}
                      sx={{ lineHeight: 1.25, color: "text.primary" }}
                    >
                      {menu.name}
                    </Typography>
                    {menu.description && (
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mt: 2, lineHeight: 1.8, fontSize: "1rem" }}
                      >
                        {menu.description}
                      </Typography>
                    )}
                  </div>
                  <div
                    style={{
                      flexShrink: 0,
                      borderRadius: "1rem",
                      paddingLeft: "1.25rem",
                      paddingRight: "1.25rem",
                      paddingTop: "0.75rem",
                      paddingBottom: "0.75rem",
                      textAlign: "right",
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="primary"
                      fontWeight={700}
                      display="block"
                      sx={{ lineHeight: 1, fontSize: "0.75rem", mb: 0.5 }}
                    >
                      ราคาเริ่มต้น
                    </Typography>
                    <Typography variant="h4" color="primary.main" fontWeight={900} sx={{ lineHeight: 1.2, fontSize: isMobile ? "1.4rem" : undefined }}>
                      ฿{menu.basePrice.toLocaleString()}
                    </Typography>
                  </div>
                </div>

                {/* เส้นคั่น */}
                <div
                  style={{ marginTop: "2.5rem", marginBottom: "2.5rem", borderTop: `1.5px dashed ${alpha(theme.palette.text.primary, 0.15)}` }}
                />

                {/* กลุ่มตัวเลือก */}
                {menu.menuItemOptionGroups.length > 0 && (
                <div className="flex flex-col" style={{ gap: "1.5rem" }}>
                    {menu.menuItemOptionGroups.map((group) => (
                      <MenuOptionGroup
                        key={group.menuItemOptionId}
                        group={group}
                        selectedIds={selectedOptions[group.menuItemOption.id] || []}
                        onToggle={handleToggleOption}
                      />
                    ))}
                  </div>
                )}

                {/* หมายเหตุ */}
                <MenuNoteField value={note} onChange={setNote} />

                {!isMobile && <div style={{ height: "5rem" }} />}
              </div>

              {/* ── ขวา: รูป + สรุปราคา (desktop เท่านั้น) ── */}
              {!isMobile && (
                <MenuPriceSummary
                  imageUrl={menu.imageUrl}
                  name={menu.name}
                  basePrice={menu.basePrice}
                  quantity={quantity}
                  totalPrice={totalPrice}
                />
              )}
            </div>
          </Container>
        </div>

        {/* Bottom bar: จำนวน + ปุ่มใส่ตะกร้า */}
        <MenuBottomBar
          quantity={quantity}
          totalPrice={totalPrice}
          isFormValid={isFormValid}
          isAdding={isAdding}
          onIncrease={() => setQuantity((q) => q + 1)}
          onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
          onAddToCart={handleAddToCart}
        />

        {/* Snackbar แจ้งเพิ่มสำเร็จ */}
        <Snackbar
          open={showSuccess}
          autoHideDuration={3000}
          onClose={() => setShowSuccess(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <MuiAlert
            onClose={() => setShowSuccess(false)}
            severity="success"
            variant="filled"
            sx={{ width: "100%", borderRadius: 3, fontWeight: 700 }}
          >
            🛒 เพิ่มลงตะกร้าเรียบร้อยแล้ว!
          </MuiAlert>
        </Snackbar>
      </div>
    </Fade>
  );
}
