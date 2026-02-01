/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
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
  Collapse,
  keyframes,
  Avatar,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField
} from "@mui/material";

// --- Icons ---
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StorefrontIcon from "@mui/icons-material/Storefront";
import HomeIcon from "@mui/icons-material/Home";
import PrintIcon from "@mui/icons-material/Print";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CelebrationIcon from "@mui/icons-material/Celebration";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CallIcon from "@mui/icons-material/Call";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen';

// --- Services & Utils ---
import { useParams, useNavigate } from "react-router-dom";
import { 
    useGetOrderByIdQuery, 
    useCancelOrderMutation 
} from "../../services/orderApi";
import { Sd } from "../../helpers/SD";

// --- Animations ---
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.4); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(39, 174, 96, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(39, 174, 96, 0); }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components (Stepper) ---
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 22 },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: { backgroundImage: "linear-gradient( 95deg, #FF9800 0%, #FF5722 100%)" },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: { backgroundImage: "linear-gradient( 95deg, #4CAF50 0%, #2E7D32 100%)" },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 4, border: 0, backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[800] : "#e0e0e0", borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled("div")<{ ownerState: { completed?: boolean; active?: boolean } }>(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[700] : "#ccc",
  zIndex: 1, color: "#fff", width: 50, height: 50, display: "flex", borderRadius: "50%", justifyContent: "center", alignItems: "center",
  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  ...(ownerState.active && { backgroundImage: "linear-gradient( 136deg, #FF9800 0%, #FF5722 100%)", boxShadow: "0 4px 15px 0 rgba(255, 87, 34, 0.4)", transform: "scale(1.2)" }),
  ...(ownerState.completed && { backgroundImage: "linear-gradient( 136deg, #4CAF50 0%, #2E7D32 100%)" }),
}));

function ColorlibStepIcon(props: any) {
  const { active, completed, className } = props;
  const icons: { [index: string]: React.ReactElement } = {
    1: <PendingActionsIcon />, 2: <RestaurantIcon />, 3: <NotificationsActiveIcon />, 4: <CelebrationIcon />,
  };
  return <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>{icons[String(props.icon)]}</ColorlibStepIconRoot>;
}

// --- Configuration Helper Functions ---
const steps = ["รับออเดอร์", "กำลังปรุง", "พร้อมเสิร์ฟ", "เสร็จสิ้น"];

const getStatusStep = (status: string) => {
  switch (status) {
    case Sd.Status_PendingPayment: case Sd.Status_Paid: return 0;
    case Sd.Status_Preparing: return 1;
    case Sd.Status_Ready: return 2;
    case Sd.Status_Completed: return 4;
    case Sd.Status_Cancelled: return -1;
    default: return 0;
  }
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case Sd.Status_PendingPayment: 
        return { color: "warning", label: "รอชำระเงิน", bg: "#FFF3E0", text: "#E65100", iconColor: "#FB8C00" };
    case Sd.Status_Paid: 
        return { color: "info", label: "รับออเดอร์แล้ว", bg: "#E3F2FD", text: "#0D47A1", iconColor: "#1976D2" };
    case Sd.Status_Preparing: 
        return { color: "secondary", label: "กำลังปรุงอาหาร", bg: "#F3E5F5", text: "#4A148C", iconColor: "#9C27B0" };
    case Sd.Status_Ready: 
        return { color: "success", label: "อาหารเสร็จแล้ว!", bg: "#E8F5E9", text: "#1B5E20", iconColor: "#2E7D32" };
    case Sd.Status_Completed: 
        return { color: "primary", label: "รับสินค้าแล้ว", bg: "#E0F7FA", text: "#006064", iconColor: "#00BCD4" };
    case Sd.Status_Cancelled: 
        return { color: "error", label: "ยกเลิก", bg: "#FFEBEE", text: "#B71C1C", iconColor: "#D32F2F" };
    default: 
        return { color: "primary", label: "รับออเดอร์แล้ว", bg: "#E3F2FD", text: "#0D47A1", iconColor: "#1976D2" };
  }
};

// Config สถานะรายจาน (กำหนดว่าสถานะไหนยกเลิกได้)
const getItemStatusConfig = (status: string) => {
  switch (status) {
    case Sd.KDS_Waiting: 
        return { label: "รอคิว", color: "default", border: "#bdbdbd", text: "#757575", icon: <HourglassEmptyIcon fontSize="inherit"/>, canCancel: true };
    case Sd.KDS_Cooking: 
        return { label: "กำลังทำ", color: "warning", border: "#FF9800", text: "#EF6C00", icon: <SoupKitchenIcon fontSize="inherit"/>, canCancel: false };
    case Sd.KDS_Done: 
        return { label: "เสร็จแล้ว", color: "success", border: "#4CAF50", text: "#2E7D32", icon: <CheckCircleIcon fontSize="inherit"/>, canCancel: false };
    case Sd.KDS_Cancelled: 
        return { label: "ยกเลิก", color: "error", border: "#EF5350", text: "#C62828", icon: <CancelIcon fontSize="inherit"/>, canCancel: false };
    default: 
        return { label: "รอคิว", color: "default", border: "#bdbdbd", text: "#757575", icon: <HourglassEmptyIcon fontSize="inherit"/>, canCancel: true };
  }
};

// --- Main Component ---
export default function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prevStatus, setPrevStatus] = useState<string>(""); 
  
  // RTK Query: ดึงข้อมูลและเชื่อมต่อ Mutation
  const { data: order, isLoading, isError } = useGetOrderByIdQuery(Number(id));
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  // State สำหรับ Dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  // targetItem: null = ยกเลิกทั้งบิล, object = ยกเลิกรายจาน
  const [targetItem, setTargetItem] = useState<{id: number, name: string} | null>(null);

  // 2. Sound Notification
  useEffect(() => {
    if (order?.orderStatus) {
      if (prevStatus !== Sd.Status_Ready && order.orderStatus === Sd.Status_Ready) {
        const audio = new Audio("/assets/sounds/notification.mp3");
        audio.play().catch(e => console.log("Blocked:", e));
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
      setPrevStatus(order.orderStatus);
    }
  }, [order?.orderStatus, prevStatus]);

  // --- Handlers ---
  const handleOpenCancelOrder = () => { 
      setTargetItem(null); 
      setCancelReason(""); 
      setConfirmDialogOpen(true); 
  };

  const handleOpenCancelItem = (itemId: number, itemName: string) => { 
      setTargetItem({ id: itemId, name: itemName }); 
      setCancelReason(""); 
      setConfirmDialogOpen(true); 
  };

  const handleConfirmCancel = async () => {
      try {
          // เตรียม Payload ตามที่ Backend ต้องการ (CancelRequest)
          const requestBody: any = {
              reason: cancelReason,
          };

          // ถ้ายกเลิกรายจาน ให้ใส่ orderItemId ไปด้วย
          if (targetItem) {
              requestBody.orderItemId = targetItem.id;
          }

          // เรียก Mutation เดียว จบงาน
          await cancelOrder({ 
              id: Number(id), 
              request: requestBody 
          }).unwrap();

          setConfirmDialogOpen(false);
      } catch (err: any) {
          console.error("Cancel failed:", err);
          const msg = err.data?.message || "ไม่สามารถยกเลิกรายการนี้ได้ (อาจจะกำลังปรุงหรือเสร็จแล้ว)";
          alert(msg);
      }
  };

  if (isLoading) return <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}><CircularProgress size={60} /></Box>;
  if (isError || !order) return <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}><Typography variant="h5" color="error">ไม่พบข้อมูลออเดอร์</Typography><Button onClick={() => navigate("/")} sx={{ mt: 2 }}>กลับหน้าหลัก</Button></Container>;

  const statusConfig: any = getStatusConfig(order.orderStatus);
  const activeStep = getStatusStep(order.orderStatus);

  return (
    <Box sx={{ bgcolor: "#F5F7FA", minHeight: "100vh", py: { xs: 3, md: 5 } }}>
      <Container maxWidth="sm">
        <Stack spacing={3} sx={{ animation: `${slideUp} 0.5s ease-out` }}>
          
          {/* 1. Header Alert (Cancelled) */}
          {order.orderStatus === Sd.Status_Cancelled && (
            <Alert severity="error" variant="filled" icon={<CallIcon fontSize="inherit" />} sx={{ borderRadius: 3, fontWeight: 600 }}>
              ออเดอร์นี้ถูกยกเลิกแล้ว
            </Alert>
          )}

          {/* 2. Main Status Card */}
          <Paper elevation={4} sx={{ p: 4, textAlign: "center", borderRadius: 5, overflow: "hidden", position: "relative", background: "#fff" }}>
            <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 10, bgcolor: statusConfig.iconColor }} />
            <Box sx={{ mt: 2, mb: 1 }}>
              {order.orderStatus === Sd.Status_Ready ? (
                <CheckCircleIcon sx={{ fontSize: 90, color: "#2E7D32", animation: `${pulse} 1.5s infinite` }} />
              ) : (
                <StorefrontIcon sx={{ fontSize: 70, color: statusConfig.iconColor, opacity: 0.9 }} />
              )}
            </Box>
            <Typography variant="h4" fontWeight={900} color="text.primary" gutterBottom>
              {order.orderStatus === Sd.Status_Ready ? "อาหารเสร็จแล้ว!" : "สั่งซื้อสำเร็จ"}
            </Typography>
            <Typography variant="body1" color="text.secondary" fontWeight={500} sx={{ mb: 3 }}>
              {order.orderStatus === Sd.Status_Ready ? "เชิญรับอาหารที่หน้าเคาน์เตอร์ได้เลยครับ" : "เราได้รับออเดอร์ของคุณเรียบร้อยแล้ว"}
            </Typography>
            <Paper elevation={0} sx={{ bgcolor: statusConfig.bg, border: `2px dashed ${statusConfig.iconColor}`, py: 2, px: 3, borderRadius: 4, mb: 3, mx: "auto", maxWidth: 280 }}>
              <Typography variant="overline" color={statusConfig.text} sx={{ letterSpacing: 2, fontWeight: 800, display: "block", mb: -1 }}>คิวรับอาหาร</Typography>
              <Typography variant="h2" fontWeight={900} color={statusConfig.text} sx={{ fontSize: { xs: "3.5rem", md: "4.5rem" }, lineHeight: 1.2 }}>{order.pickUpCode || "-"}</Typography>
            </Paper>
            <Chip label={statusConfig.label} sx={{ bgcolor: statusConfig.iconColor, color: "#fff", fontWeight: 800, px: 3, py: 3, fontSize: "1.1rem", borderRadius: 50, boxShadow: "0 4px 10px rgba(0,0,0,0.15)" }} />
          </Paper>

          {/* 3. Timeline */}
          {order.orderStatus !== Sd.Status_Cancelled && (
            <Paper sx={{ p: 3, borderRadius: 4, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <Typography variant="h6" fontWeight={800} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AccessTimeFilledIcon color="action" /> สถานะออเดอร์
              </Typography>
              <Box sx={{ mt: 2 }}>
                  <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
                    {steps.map((label) => (
                      <Step key={label}>
                        <StepLabel StepIconComponent={ColorlibStepIcon}>
                          <Typography variant="caption" fontWeight={700} sx={{ fontSize: "0.85rem", color: "#455a64" }}>{label}</Typography>
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
              </Box>
              <Collapse in={order.orderStatus === Sd.Status_Preparing}>
                <Alert severity="info" icon={<RestaurantIcon />} sx={{ mt: 3, borderRadius: 3, fontWeight: 600, bgcolor: "#E3F2FD", color: "#0D47A1" }}>
                    กำลังปรุง... อดใจรอสักครู่นะครับ
                </Alert>
              </Collapse>
            </Paper>
          )}

          {/* 4. Payment Alert */}
          {order.orderStatus === Sd.Status_PendingPayment && (
            <Paper sx={{ p: 3, borderRadius: 4, borderLeft: "6px solid #FF9800", bgcolor: "#FFF8E1" }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1.5, bgcolor: "#fff", borderRadius: "50%" }}>
                    <QrCodeScannerIcon color="warning" sx={{ fontSize: 32 }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={800} color="#E65100">รอชำระเงิน</Typography>
                  <Typography variant="body2" color="text.secondary">กรุณาสแกนจ่ายหรือชำระที่เคาน์เตอร์</Typography>
                </Box>
                <Button variant="contained" color="warning" sx={{ borderRadius: 2, fontWeight: 700 }} onClick={() => alert("เปิด Modal Scan")}>
                  สแกนจ่าย
                </Button>
              </Stack>
            </Paper>
          )}

          {/* 5. Detailed Menu List */}
          <Paper sx={{ p: 0, borderRadius: 4, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
             <Box sx={{ p: 2.5, bgcolor: "#fff", borderBottom: "1px solid #eee" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={800} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <LocalDiningIcon color="primary" /> รายการอาหาร
                        <Chip label={`${order.orderDetails?.length || 0}`} size="small" sx={{ fontWeight: 700, bgcolor: "#f5f5f5" }} />
                    </Typography>
                    <IconButton size="small" onClick={() => window.print()} sx={{ bgcolor: "#f5f5f5" }}><PrintIcon fontSize="small" /></IconButton>
                </Stack>
             </Box>
             
             <Stack spacing={0} sx={{ p: 2 }}>
                {order.orderDetails?.map((item: any, index: number) => {
                    const itemStatus = getItemStatusConfig(item.kitchenStatus);
                    return (
                        <Box key={index}>
                            <Grid container spacing={2} alignItems="center" sx={{ py: 2 }}>
                                {/* Image */}
                                <Grid>
                                    <Avatar src={item.menuItemImage} variant="rounded" sx={{ width: 64, height: 64, bgcolor: "#f5f5f5" }}>
                                        <RestaurantIcon color="disabled" />
                                    </Avatar>
                                </Grid>

                                {/* Name & Options */}
                                <Grid size="grow">
                                    <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>
                                        {item.quantity}x {item.menuItemName}
                                    </Typography>
                                    {item.orderDetailOptions?.length > 0 && (
                                        <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                                            {item.orderDetailOptions.map((o: any, i: number) => (
                                                <Typography key={i} variant="caption" sx={{ color: "#616161", bgcolor: "#f5f5f5", px: 0.8, py: 0.3, borderRadius: 1 }}>{o.optionValueName}</Typography>
                                            ))}
                                        </Stack>
                                    )}
                                    <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ mt: 0.5 }}>
                                        ฿{item.totalPrice.toLocaleString()}
                                    </Typography>
                                </Grid>

                                {/* Status & Cancel */}
                                <Grid sx={{ textAlign: "right", minWidth: 90 }}>
                                    <Chip 
                                        label={itemStatus.label} 
                                        icon={itemStatus.icon}
                                        size="small" 
                                        sx={{ 
                                            fontWeight: 700, 
                                            bgcolor: "transparent",
                                            border: `1px solid ${itemStatus.border}`,
                                            color: itemStatus.text,
                                            height: 26,
                                            fontSize: "0.75rem",
                                            mb: 1,
                                            width: '100%',
                                            justifyContent: 'flex-start',
                                            pl: 0.5
                                        }} 
                                    />
                                    {/* 🔥 ปุ่มยกเลิกรายจาน (แสดงเฉพาะตอน Waiting) */}
                                    {itemStatus.canCancel && (
                                        <Button 
                                            size="small" 
                                            color="error" 
                                            variant="outlined" 
                                            onClick={() => handleOpenCancelItem(item.id, item.menuItemName)}
                                            sx={{ 
                                                fontSize: '0.7rem', 
                                                py: 0.2, 
                                                width: '100%', 
                                                textTransform: 'none',
                                                borderColor: '#ffcdd2',
                                                color: '#e53935',
                                                '&:hover': { bgcolor: '#ffebee', borderColor: '#e53935' }
                                            }}
                                        >
                                            ยกเลิก
                                        </Button>
                                    )}
                                </Grid>
                            </Grid>
                            {index < order.orderDetails.length - 1 && <Divider sx={{ borderStyle: "dashed" }} />}
                        </Box>
                    );
                })}
             </Stack>
             
             <Box sx={{ p: 2.5, bgcolor: "#FAFAFA", borderTop: "2px dashed #eee" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700} color="text.secondary">ยอดรวมสุทธิ</Typography>
                    <Typography variant="h4" fontWeight={900} color="primary.main">฿{order.total.toLocaleString()}</Typography>
                </Stack>
             </Box>
          </Paper>

          {/* 6. Footer Buttons */}
          <Stack spacing={2}>
             {[Sd.Status_PendingPayment, Sd.Status_Paid].includes(order.orderStatus) && (
                <Button 
                    fullWidth 
                    variant="outlined" 
                    color="error" 
                    startIcon={<CancelIcon />}
                    onClick={handleOpenCancelOrder}
                    sx={{ borderRadius: 3, borderWidth: 2, py: 1.5, fontWeight: 700 }}
                >
                    ยกเลิกออเดอร์ทั้งหมด
                </Button>
             )}
             
             <Button fullWidth variant="contained" size="large" startIcon={<HomeIcon />} onClick={() => navigate("/")} 
                sx={{ 
                    borderRadius: 3, 
                    py: 1.8, 
                    fontWeight: 800, 
                    fontSize: "1rem", 
                    background: "linear-gradient(45deg, #FF9800 30%, #FF5722 90%)",
                    boxShadow: "0 4px 12px rgba(255, 87, 34, 0.3)"
                }}>
                กลับหน้าหลัก / สั่งเพิ่ม
             </Button>
          </Stack>
          
          <Typography variant="caption" display="block" textAlign="center" color="text.secondary" sx={{ mt: 2, opacity: 0.7 }}>
             Order ID: #{order.id} • {new Date(order.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
          </Typography>

        </Stack>

        {/* --- Dialog Confirmation --- */}
        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
            <DialogTitle fontWeight={700} color="error">
                {targetItem ? `ยกเลิกรายการ "${targetItem.name}"?` : "ยกเลิกออเดอร์ทั้งหมด?"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    {targetItem 
                        ? "คุณแน่ใจหรือไม่ว่าต้องการยกเลิกรายการนี้? หากยกเลิกแล้วจะไม่สามารถกู้คืนได้" 
                        : "การยกเลิกออเดอร์จะทำให้รายการอาหารทั้งหมดถูกยกเลิกทันที คุณแน่ใจหรือไม่?"
                    }
                </DialogContentText>
                {/* ถ้าเป็นการยกเลิกออเดอร์ใหญ่ ให้ใส่เหตุผลได้ */}
                {!targetItem && (
                    <TextField
                        autoFocus
                        margin="dense"
                        label="ระบุเหตุผล (ไม่บังคับ)"
                        fullWidth
                        variant="outlined"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                    />
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={() => setConfirmDialogOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>ปิด</Button>
                <Button 
                    onClick={handleConfirmCancel} 
                    variant="contained" 
                    color="error" 
                    disabled={isCancelling}
                    sx={{ fontWeight: 700, borderRadius: 2 }}
                >
                    {isCancelling ? "กำลังดำเนินการ..." : "ยืนยันการยกเลิก"}
                </Button>
            </DialogActions>
        </Dialog>

      </Container>
    </Box>
  );
}