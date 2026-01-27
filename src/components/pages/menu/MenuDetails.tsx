/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
  Container,
  Paper,
  Grid,
  CircularProgress,
  alpha,
  Alert,
  Divider,
  Fade,
  Chip,
  useTheme,
  useMediaQuery,
  TextField,
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { useGetMenuItemByIdQuery } from "../../../services/menuItemApi";
import { useAddtoCartMutation } from "../../../services/shoppingCartApi";
import { useAppSelector } from "../../../hooks/useAppHookState";
import type { AddToCart } from "../../../@types/createDto/AddToCart";

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
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="90vh"
      >
        <CircularProgress color="primary" thickness={5} />
      </Box>
    );

  if (error || !menu)
    return (
      <Container sx={{ py: 10, textAlign: "center" }}>
        <Alert severity="error" variant="filled" sx={{ borderRadius: 4 }}>
          ไม่พบข้อมูลเมนู หรือเกิดข้อผิดพลาด
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate(-1)}
          sx={{ mt: 3, borderRadius: 3 }}
        >
          กลับหน้าหลัก
        </Button>
      </Container>
    );

  return (
    <Fade in={!isLoading}>
      <Box
        sx={{ pb: { xs: 15, md: 8 }, bgcolor: "#F8F9FA", minHeight: "100vh" }}
      >
        {/* Desktop Back Button */}
        {!isMobile && (
          <Container maxWidth="lg" sx={{ pt: 4 }}>
            <Button
              startIcon={<ArrowBackIosNewRoundedIcon />}
              onClick={() => navigate(-1)}
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                "&:hover": { bgcolor: "transparent", color: "primary.main" },
              }}
            >
              กลับหน้าเมนู
            </Button>
          </Container>
        )}

        <Container maxWidth="lg" sx={{ pt: { xs: 0, md: 4 } }}>
          <Grid container spacing={{ xs: 0, md: 6 }}>
            {/* Image Section */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  position: isMobile ? "relative" : "sticky",
                  top: isMobile ? 0 : 100,
                  mx: isMobile ? -2 : 0,
                }}
              >
                {isMobile && (
                  <IconButton
                    onClick={() => navigate(-1)}
                    sx={{
                      position: "absolute",
                      top: 20,
                      left: 32,
                      zIndex: 10,
                      bgcolor: "rgba(255,255,255,0.85)",
                      backdropFilter: "blur(8px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      "&:hover": { bgcolor: "#fff" },
                    }}
                  >
                    <ArrowBackIosNewRoundedIcon fontSize="small" />
                  </IconButton>
                )}
                <Box
                  component="img"
                  src={
                    menu.imageUrl || "https://placehold.co/800x800?text=Menu"
                  }
                  sx={{
                    width: "100%",
                    aspectRatio: isMobile ? "4/3" : "1/1",
                    objectFit: "cover",
                    borderRadius: isMobile ? "0 0 40px 40px" : 10,
                    boxShadow: isMobile
                      ? "none"
                      : "0 25px 50px -12px rgba(0,0,0,0.15)",
                  }}
                />
              </Box>
            </Grid>

            {/* Details Section */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack
                spacing={4}
                sx={{ mt: isMobile ? 3 : 0, px: isMobile ? 2 : 0 }}
              >
                <Box>
                  <Typography
                    variant="overline"
                    color="primary"
                    sx={{ fontWeight: 800, letterSpacing: 1.5 }}
                  >
                    {menu.menuCategoryName}
                  </Typography>
                  <Typography
                    variant={isMobile ? "h4" : "h2"}
                    fontWeight={800}
                    gutterBottom
                    sx={{ lineHeight: 1.2 }}
                  >
                    {menu.name}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontSize: "1.1rem", lineHeight: 1.8, mb: 2 }}
                  >
                    {menu.description}
                  </Typography>
                  <Typography
                    variant="h4"
                    color="primary.main"
                    fontWeight={900}
                  >
                    ฿{menu.basePrice.toLocaleString()}
                  </Typography>
                </Box>

                <Divider
                  sx={{
                    borderStyle: "dashed",
                    borderColor: alpha("#000", 0.1),
                  }}
                />

                {/* Options */}
                {menu.menuItemOptionGroups.map((group) => {
                  const opt = group.menuItemOption;
                  return (
                    <Box key={group.id}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 2 }}
                      >
                        <Typography variant="h6" fontWeight={700}>
                          {opt.name}
                          {opt.isRequired && (
                            <Typography
                              component="span"
                              color="error.main"
                              sx={{ ml: 0.5 }}
                            >
                              *
                            </Typography>
                          )}
                        </Typography>
                        <Chip
                          label={opt.isRequired ? "จำเป็น" : "เลือกเพิ่มได้"}
                          size="small"
                          color={opt.isRequired ? "error" : "default"}
                          variant={opt.isRequired ? "filled" : "outlined"}
                          sx={{
                            borderRadius: 1.5,
                            fontWeight: 700,
                            fontSize: "0.75rem",
                          }}
                        />
                      </Stack>

                      <Grid container spacing={2}>
                        {opt.menuOptionDetails.map((detail) => {
                          const isSelected = selectedOptions[opt.id]?.includes(
                            detail.id
                          );
                          return (
                            <Grid size={{ xs: 12, sm: 6 }} key={detail.id}>
                              <Button
                                fullWidth
                                onClick={() =>
                                  handleToggleOption(
                                    opt.id,
                                    detail.id,
                                    opt.isMultiple
                                  )
                                }
                                sx={{
                                  justifyContent: "space-between",
                                  p: 2,
                                  borderRadius: 4,
                                  border: "2px solid",
                                  borderColor: isSelected
                                    ? "primary.main"
                                    : alpha("#000", 0.08),
                                  bgcolor: isSelected
                                    ? alpha(theme.palette.primary.main, 0.04)
                                    : "#fff",
                                  color: "text.primary",
                                  transition:
                                    "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                  "&:hover": {
                                    borderColor: "primary.main",
                                    bgcolor: alpha(
                                      theme.palette.primary.main,
                                      0.02
                                    ),
                                  },
                                }}
                              >
                                <Stack
                                  direction="row"
                                  spacing={1.5}
                                  alignItems="center"
                                >
                                  {isSelected ? (
                                    <CheckCircleRoundedIcon
                                      color="primary"
                                      fontSize="small"
                                    />
                                  ) : (
                                    <Box
                                      sx={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: "50%",
                                        border: "2px solid",
                                        borderColor: alpha("#000", 0.1),
                                      }}
                                    />
                                  )}
                                  <Typography
                                    variant="body1"
                                    fontWeight={isSelected ? 700 : 500}
                                  >
                                    {detail.name}
                                  </Typography>
                                </Stack>
                                <Typography
                                  variant="body2"
                                  color="primary.main"
                                  fontWeight={700}
                                >
                                  {detail.extraPrice > 0
                                    ? `+฿${detail.extraPrice}`
                                    : "ฟรี"}
                                </Typography>
                              </Button>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  );
                })}

                {/* ✅ 4. เพิ่ม Note Input */}
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    รายละเอียดเพิ่มเติม (Note)
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="เช่น หวานน้อย, แยกน้ำแข็ง (ระบุได้เลย)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 4,
                        bgcolor: "#fff",
                      },
                    }}
                  />
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Container>

        {/* Sticky Bottom Bar */}
        <Paper
          elevation={10}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            p: isMobile ? 2 : 3,
            borderRadius: isMobile ? "28px 28px 0 0" : 0,
            borderTop: "1px solid",
            borderColor: alpha("#000", 0.05),
            backdropFilter: "blur(10px)",
            bgcolor: "rgba(255,255,255,0.95)",
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 5, md: 3 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    borderRadius: 4,
                    p: 0.5,
                  }}
                >
                  <IconButton
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    color="primary"
                    size="small"
                  >
                    <RemoveRoundedIcon />
                  </IconButton>
                  <Typography variant="h6" fontWeight={900}>
                    {quantity}
                  </Typography>
                  <IconButton
                    onClick={() => setQuantity((q) => q + 1)}
                    color="primary"
                    size="small"
                  >
                    <AddRoundedIcon />
                  </IconButton>
                </Stack>
              </Grid>
              <Grid size={{ xs: 7, md: 9 }}>
                {/* ✅ 5. เชื่อมปุ่มกับ handleAddToCart */}
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  disabled={!isFormValid || isAdding}
                  startIcon={
                    isAdding ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      <ShoppingBagRoundedIcon />
                    )
                  }
                  sx={{
                    py: isMobile ? 1.8 : 2.2,
                    borderRadius: 4,
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    textTransform: "none",
                    boxShadow:
                      "0 10px 20px " + alpha(theme.palette.primary.main, 0.3),
                  }}
                  onClick={handleAddToCart}
                >
                  {isFormValid
                    ? `ใส่ตะกร้า • ฿${totalPrice.toLocaleString()}`
                    : "เลือกให้ครบ"}
                </Button>
              </Grid>
            </Grid>
          </Container>
        </Paper>

        {/* ✅ 6. Success Feedback */}
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
            sx={{ width: "100%", borderRadius: 3 }}
          >
            เพิ่มสินค้าลงตะกร้าเรียบร้อยแล้ว
          </MuiAlert>
        </Snackbar>
      </Box>
    </Fade>
  );
}
