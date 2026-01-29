/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Stack,
  Divider,
  Button,
  CircularProgress,
  Chip,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  styled,
  Alert,
  Collapse
} from "@mui/material";

// Icons
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import StorefrontIcon from "@mui/icons-material/Storefront";
import HomeIcon from "@mui/icons-material/Home";
import PrintIcon from "@mui/icons-material/Print";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CelebrationIcon from "@mui/icons-material/Celebration";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CallIcon from "@mui/icons-material/Call";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { useParams, useNavigate } from "react-router-dom";
import { useGetOrderByIdQuery } from "../../services/orderApi";

// ------------------- Custom Styles for Stepper -------------------
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage:
        "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor:
      theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor:
    theme.palette.mode === "dark" ? theme.palette.grey[700] : "#ccc",
  zIndex: 1,
  color: "#fff",
  width: 50,
  height: 50,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  ...(ownerState.active && {
    backgroundImage:
      "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
    boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
  }),
  ...(ownerState.completed && {
    backgroundImage:
      "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
  }),
}));

function ColorlibStepIcon(props: any) {
  const { active, completed, className } = props;

  const icons: { [index: string]: React.ReactElement } = {
    1: <PendingActionsIcon />,
    2: <RestaurantIcon />,
    3: <NotificationsActiveIcon />,
    4: <CelebrationIcon />,
  };

  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active }}
      className={className}
    >
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

// ------------------- Helper Functions -------------------
const steps = ["รับออเดอร์", "กำลังปรุง", "พร้อมเสิร์ฟ", "เสร็จสิ้น"];

const getStatusStep = (status: string) => {
  switch (status) {
    case "PendingPayment":
    case "Paid":
      return 0; // รับออเดอร์
    case "Preparing":
      return 1; // กำลังปรุง
    case "Ready":
      return 2; // พร้อมเสิร์ฟ
    case "Completed":
      return 4; // เสร็จสิ้น (เต็มหลอด)
    case "Cancelled":
      return -1;
    default:
      return 0;
  }
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "PendingPayment":
      return { color: "warning", label: "รอชำระเงิน", bg: "#fff3e0" };
    case "Preparing":
      return { color: "secondary", label: "กำลังปรุงอาหาร", bg: "#f3e5f5" };
    case "Ready":
      return { color: "success", label: "อาหารเสร็จแล้ว!", bg: "#e8f5e9" };
    case "Completed":
      return { color: "info", label: "รับสินค้าแล้ว", bg: "#e3f2fd" };
    case "Cancelled":
      return { color: "error", label: "ยกเลิก", bg: "#ffebee" };
    default:
      return { color: "primary", label: "รับออเดอร์แล้ว", bg: "#e3f2fd" };
  }
};

// ------------------- Main Component -------------------
export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ดึงข้อมูล Real-time
  const { data: order, isLoading, isError } = useGetOrderByIdQuery(Number(id));

  // --- Loading State ---
  if (isLoading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );

  // --- Error State ---
  if (isError || !order)
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
        <Typography variant="h5" color="error" gutterBottom>
          ไม่พบข้อมูลออเดอร์
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/")}
          sx={{ mt: 2, borderRadius: 2 }}
        >
          กลับหน้าหลัก
        </Button>
      </Container>
    );

  const statusConfig: any = getStatusConfig(order.orderStatus);
  const activeStep = getStatusStep(order.orderStatus);

  return (
    <Box sx={{ bgcolor: "#f4f6f8", minHeight: "100vh", py: { xs: 3, md: 6 } }}>
      <Container maxWidth="sm">
        <Stack spacing={3}>
          {/* 1. Header & Cancelled Alert */}
          {order.orderStatus === "Cancelled" && (
            <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
              <Typography fontWeight="bold">ออเดอร์นี้ถูกยกเลิก</Typography>
              กรุณาติดต่อพนักงานหากเกิดข้อผิดพลาด
            </Alert>
          )}

          {/* 2. Main Status Card (Queue Card) */}
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 5,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Top Color Bar */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 8,
                bgcolor: `${statusConfig.color}.main`,
              }}
            />

            <Box sx={{ mt: 2, mb: 2 }}>
              {order.orderStatus === "Ready" ? (
                <CheckCircleOutlineIcon
                  sx={{ fontSize: 80, color: "success.main" }}
                />
              ) : (
                <StorefrontIcon
                  sx={{ fontSize: 60, color: `${statusConfig.color}.main` }}
                />
              )}
            </Box>

            <Typography variant="h4" fontWeight={800} gutterBottom>
              {order.orderStatus === "Ready"
                ? "อาหารเสร็จแล้ว!"
                : "สั่งซื้อสำเร็จ"}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {order.orderStatus === "Ready"
                ? "กรุณาแสดงรหัสนี้เพื่อรับสินค้าที่เคาน์เตอร์"
                : "ระบบได้รับออเดอร์ของคุณแล้ว"}
            </Typography>

            {/* Queue Number Box */}
            <Box
              sx={{
                bgcolor: "#fff",
                border: "3px dashed",
                borderColor: `${statusConfig.color}.light`,
                py: 3,
                px: 2,
                borderRadius: 4,
                mb: 3,
                mx: "auto",
                maxWidth: 300,
                boxShadow: "inset 0 0 20px rgba(0,0,0,0.02)",
              }}
            >
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: 2, fontWeight: 700 }}
              >
                คิวรับอาหาร
              </Typography>
              <Typography
                variant="h1"
                fontWeight={900}
                color={`${statusConfig.color}.main`}
                sx={{ fontSize: { xs: "4rem", md: "5rem" }, lineHeight: 1 }}
              >
                {order.pickUpCode || "-"}
              </Typography>
            </Box>

            <Chip
              label={statusConfig.label}
              color={statusConfig.color}
              sx={{
                fontWeight: 800,
                px: 2,
                py: 2.5,
                fontSize: "1rem",
                borderRadius: 3,
              }}
            />
          </Paper>

          {/* 3. Timeline Stepper (ซ่อนถ้ายกเลิก) */}
          {order.orderStatus !== "Cancelled" && (
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                สถานะการดำเนินการ
              </Typography>
              <Stepper
                alternativeLabel
                activeStep={activeStep}
                connector={<ColorlibConnector />}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel StepIconComponent={ColorlibStepIcon}>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{ fontSize: "0.8rem" }}
                      >
                        {label}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Estimated Time (Show when Preparing) */}
              <Collapse in={order.orderStatus === "Preparing"}>
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: "#fff3e0",
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <RestaurantIcon color="warning" />
                  <Typography variant="body2" fontWeight={600} color="orange">
                    กำลังปรุง... คาดว่าจะได้รับใน 10 - 15 นาที
                  </Typography>
                </Box>
              </Collapse>
            </Paper>
          )}

          {/* 4. Payment Alert (เฉพาะ PendingPayment) */}
          {order.orderStatus === "PendingPayment" && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                border: "1px solid #ff9800",
                bgcolor: "#fff8e1",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <QrCodeScannerIcon
                  color="warning"
                  sx={{ fontSize: 40, display: { xs: "none", sm: "block" } }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={800}>
                    ยังไม่ได้ชำระเงิน
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    กรุณาชำระเงินที่เคาน์เตอร์ หรือสแกนจ่ายเพื่อเริ่มทำอาหาร
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  onClick={() => alert("เปิด Modal Scan QR Code")}
                >
                  สแกนจ่าย
                </Button>
              </Stack>
            </Paper>
          )}

          {/* 5. Order Details & Actions */}
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <ReceiptLongIcon fontSize="small" color="primary" /> รายการอาหาร
              </Typography>
              <IconButton size="small" onClick={() => window.print()}>
                <PrintIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Stack spacing={2} sx={{ mb: 2 }}>
              {order.orderDetails?.map((item: any, index: number) => (
                <Stack
                  key={index}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      {item.quantity}x {item.menuItemName}
                    </Typography>
                    {/* Show Options */}
                    {item.orderDetailOptions?.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        {item.orderDetailOptions
                          .map((o: any) => o.optionValueName)
                          .join(", ")}
                      </Typography>
                    )}
                    {item.note && (
                      <Typography variant="caption" color="error" display="block">
                        * {item.note}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    ฿{item.totalPrice.toLocaleString()}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            <Divider sx={{ borderStyle: "dashed", mb: 2 }} />

            <Stack direction="row" justifyContent="space-between" mb={3}>
              <Typography variant="h6" fontWeight={800}>
                ยอดรวมสุทธิ
              </Typography>
              <Typography
                variant="h5"
                fontWeight={900}
                color="primary.main"
              >
                ฿{order.total.toLocaleString()}
              </Typography>
            </Stack>

            {/* Action Buttons */}
            <Stack spacing={2}>
              {/* ปุ่มแจ้งปัญหา (แสดงเฉพาะตอนรอจ่าย หรือรอทำ) */}
              {["PendingPayment", "Paid"].includes(order.orderStatus) && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<CallIcon />}
                  sx={{ borderRadius: 3, borderWidth: 2 }}
                >
                  แจ้งปัญหา / ยกเลิกออเดอร์
                </Button>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<HomeIcon />}
                onClick={() => navigate("/")}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  fontWeight: 800,
                  fontSize: "1rem",
                  boxShadow: 2,
                }}
              >
                กลับหน้าหลัก / สั่งเพิ่ม
              </Button>
            </Stack>

            <Typography
              variant="caption"
              display="block"
              textAlign="center"
              color="text.secondary"
              sx={{ mt: 3 }}
            >
              Order ID: #{order.id} •{" "}
              {new Date(order.createdAt).toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}