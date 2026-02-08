/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import type { StepIconProps } from "@mui/material";
import {
  Drawer, Box, Stack, Typography, IconButton, Divider, Avatar, Button, TextField, Chip, Alert, Tooltip,
  Stepper, Step, StepLabel, StepConnector, stepConnectorClasses, styled, Grid, Card, CardContent,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Menu, MenuItem, ListItemIcon, ListItemText
} from "@mui/material";

// Icons
import CloseIcon from "@mui/icons-material/Close";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TakeoutDiningIcon from "@mui/icons-material/TakeoutDining";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PaidIcon from '@mui/icons-material/Paid';
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen';
import RoomServiceIcon from '@mui/icons-material/RoomService';
import FlagIcon from '@mui/icons-material/Flag';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import NewReleasesIcon from '@mui/icons-material/NewReleases'; // ไอคอนสำหรับ Pending

// Types & API & Sd
import type { OrderHeader } from "../../../../@types/dto/OrderHeader";
import {
  useUpdateOrderStatusMutation,
  useUpdateOrderMutation,
  useCancelOrderMutation,
  useUpdateKitchenStatusMutation,
} from "../../../../services/orderApi";
import { Sd } from "../../../../helpers/SD";
import type { CancelRequest } from "../../../../@types/requests/CancelRequest";
import OrderStatusBadge from "../../../../utility/OrderStatusBadge";

// --- 🎨 Custom Styles ---
const BRAND_COLOR = "#D32F2F"; 
const BG_COLOR = "#f5f5f5";    

// ... (ColorlibConnector คงเดิม) ...
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 22 },
  [`&.${stepConnectorClasses.active}`]: { [`& .${stepConnectorClasses.line}`]: { backgroundImage: `linear-gradient( 95deg, ${BRAND_COLOR} 0%, #ff8a80 50%, #e0e0e0 100%)` } },
  [`&.${stepConnectorClasses.completed}`]: { [`& .${stepConnectorClasses.line}`]: { backgroundImage: `linear-gradient( 95deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR} 100%)` } },
  [`& .${stepConnectorClasses.line}`]: { height: 3, border: 0, backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0', borderRadius: 1 },
}));

// ... (ColorlibStepIconRoot คงเดิม) ...
const ColorlibStepIconRoot = styled('div')<{ ownerState: { completed?: boolean; active?: boolean } }>(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1, color: '#fff', width: 50, height: 50, display: 'flex', borderRadius: '50%', justifyContent: 'center', alignItems: 'center',
  transition: 'all 0.3s ease', boxShadow: '0 4px 10px 0 rgba(0,0,0,.1)',
  ...(ownerState.active && { backgroundImage: `linear-gradient( 136deg, #ff5252 0%, ${BRAND_COLOR} 50%, #b71c1c 100%)`, boxShadow: '0 4px 20px 0 rgba(211, 47, 47, 0.5)', transform: 'scale(1.2)' }),
  ...(ownerState.completed && { backgroundImage: `linear-gradient( 136deg, #ff5252 0%, ${BRAND_COLOR} 100%)` }),
}));

// ✅ ปรับ Step Icon ให้รองรับสถานะใหม่
function ColorlibStepIcon(props: StepIconProps) {
  const icons: { [index: string]: React.ReactElement } = { 
    1: <NewReleasesIcon />, // รออนุมัติ
    2: <PaidIcon />,        // รอชำระ/อนุมัติแล้ว
    3: <SoupKitchenIcon />, // กำลังปรุง
    4: <RoomServiceIcon />, // พร้อมเสิร์ฟ
    5: <FlagIcon />         // เสร็จสิ้น
  };
  return <ColorlibStepIconRoot ownerState={{ completed: props.completed, active: props.active }}>{icons[String(props.icon)]}</ColorlibStepIconRoot>;
}

type Props = {
  open: boolean;
  onClose: () => void;
  order: OrderHeader | null;
};

export default function OrderDetailDrawer({ open, onClose, order }: Props) {
  const [updateStatus, { isLoading: loadingStatus }] = useUpdateOrderStatusMutation();
  const [updateOrder, { isLoading: loadingUpdate }] = useUpdateOrderMutation();
  const [cancelOrder, { isLoading: loadingCancel }] = useCancelOrderMutation();
  const [updateKitchen, { isLoading: loadingKitchen }] = useUpdateKitchenStatusMutation();
  const isLoading = loadingStatus || loadingUpdate || loadingCancel || loadingKitchen;

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ customerName: "", customerPhone: "", note: "" });
  
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [targetItemId, setTargetItemId] = useState<number | null>(null);
  const [targetItemName, setTargetItemName] = useState("");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  useEffect(() => {
    if (order) {
      setEditForm({
        customerName: order.customerName || "",
        customerPhone: order.customerPhone || "",
        note: order.customerNote || "",
      });
      setIsEditing(false);
      setCancelDialogOpen(false);
      setCancelReason("");
      setTargetItemId(null);
      setAnchorEl(null);
    }
  }, [order, open]);

  if (!order) return null;

  const handleStatusChange = async (nextStatus: string) => {
    try { await updateStatus({ id: order.id, newStatus: nextStatus }).unwrap(); } 
    catch (err) { alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ"); }
  };

  const handleSaveEdit = async () => {
    try {
      await updateOrder({ id: order.id, customerName: editForm.customerName, customerPhone: editForm.customerPhone, customerNote: editForm.note }).unwrap();
      setIsEditing(false);
    } catch (err) { alert("บันทึกข้อมูลไม่สำเร็จ"); }
  };

  // ... (Cancel Logic คงเดิม) ...
  const handleOpenCancelOrder = () => { setTargetItemId(null); setTargetItemName(""); setCancelReason(""); setCancelDialogOpen(true); };
  const handleOpenCancelItem = (itemId: number, itemName: string) => { setTargetItemId(itemId); setTargetItemName(itemName); setCancelReason(""); setCancelDialogOpen(true); };

  const handleConfirmCancel = async () => {
    // if (!cancelReason.trim()) return alert("กรุณาระบุเหตุผลการยกเลิก"); // อาจจะ Optional
    try {
      const request: CancelRequest = { isAdmin: true, orderItemId: targetItemId ?? undefined };
      await cancelOrder({ id: order.id, request }).unwrap();
      setCancelDialogOpen(false);
      if (!targetItemId) onClose();
    } catch (err: any) { alert(err.data?.message || "ดำเนินการไม่สำเร็จ"); }
  };

  // ... (Menu Logic คงเดิม) ...
  const handleOpenStatusMenu = (event: React.MouseEvent<HTMLElement>, itemId: number) => {
      setAnchorEl(event.currentTarget);
      setSelectedItemId(itemId);
  };
  const handleCloseStatusMenu = () => {
      setAnchorEl(null);
      setSelectedItemId(null);
  };
  const handleChangeItemStatus = async (newStatus: string) => {
      if (selectedItemId) {
          try { await updateKitchen({ detailId: selectedItemId, status: newStatus }).unwrap(); } 
          catch (err) { console.error(err); }
      }
      handleCloseStatusMenu();
  };

  // ... (Item Status Helper คงเดิม) ...
  const getItemStatusInfo = (status: string) => {
      switch (status) {
          case Sd.KDS_Waiting: return { label: "รอคิว", color: "inherit", icon: <HourglassEmptyIcon fontSize="small" />, bg: "#f5f5f5", text: "#757575" };
          case Sd.KDS_Cooking: return { label: "กำลังปรุง", color: "warning", icon: <SoupKitchenIcon fontSize="small" />, bg: "#fff3e0", text: "#e65100" };
          case Sd.KDS_Done: return { label: "เสร็จแล้ว", color: "success", icon: <CheckCircleIcon fontSize="small" />, bg: "#e8f5e9", text: "#2e7d32" };
          case Sd.KDS_Cancelled: return { label: "ยกเลิก", color: "error", icon: <DeleteForeverIcon fontSize="small" />, bg: "#ffebee", text: "#c62828" };
          default: return { label: "รอคิว", color: "inherit", icon: <HourglassEmptyIcon fontSize="small" />, bg: "#f5f5f5", text: "#757575" };
      }
  };

  // ✅ [จุดที่ 1] ปรับ Logic Stepper ให้รองรับ Pending
  const getActiveStep = (status: string) => {
    if (status === Sd.Status_Cancelled) return -1;
    
    const stepsFlow = [
        Sd.Status_Pending,        // 0: รออนุมัติ
        Sd.Status_PendingPayment, // 1: รอจ่าย (ถ้าข้ามขั้นนี้ ก็ถือว่าผ่าน)
        Sd.Status_Preparing,      // 2: กำลังปรุง
        Sd.Status_Ready,          // 3: พร้อมรับ
        Sd.Status_Completed       // 4: จบ
    ];

    // กรณีพิเศษ: ถ้าจ่ายแล้ว หรือ อนุมัติแล้ว ให้ถือว่าผ่าน Step 1 มาแล้ว
    if (status === Sd.Status_Paid || status === Sd.Status_Approved) return 2; 

    // กรณีปกติ
    const index = stepsFlow.indexOf(status);
    return index === -1 ? 0 : index;
  };

  return (
    <>
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", md: 650 }, bgcolor: BG_COLOR } }}
    >
      {/* Header */}
      <Box sx={{ p: 2.5, bgcolor: "white", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee", boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: "ffebee", color: BRAND_COLOR }}><ReceiptLongIcon /></Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800} lineHeight={1.2} sx={{ color: '#333' }}>{order.orderCode}</Typography>
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                {/* ✅ เปลี่ยนมาใช้ Badge ใหม่ */}
               <OrderStatusBadge status={order.orderStatus} />
               <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, borderLeft: '1px solid #ddd', pl: 1 }}>
                    <TakeoutDiningIcon fontSize="inherit" /> PickUp: <strong>{order.pickUpCode || "-"}</strong>
               </Typography>
            </Stack>
          </Box>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: '#999' }}><CloseIcon /></IconButton>
      </Box>

      <Box sx={{ p: 3, flex: 1, overflowY: "auto" }}>
        <Stack spacing={3}>
          {/* Timeline */}
          {order.orderStatus !== Sd.Status_Cancelled && (
            <Box sx={{ width: '100%', py: 2 }}>
              <Stepper alternativeLabel activeStep={getActiveStep(order.orderStatus)} connector={<ColorlibConnector />}>
                {['รออนุมัติ', 'ชำระเงิน/รอคิว', 'กำลังปรุง', 'พร้อมรับ', 'สำเร็จ'].map((label) => (
                  <Step key={label}><StepLabel StepIconComponent={ColorlibStepIcon}><Typography variant="caption" fontWeight={700} sx={{ mt: 1, display: 'block' }}>{label}</Typography></StepLabel></Step>
                ))}
              </Stepper>
            </Box>
          )}
          
          {/* ✅ [จุดที่ 2] Action Board (Global Actions) */}
          {order.orderStatus !== Sd.Status_Cancelled && (
            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${BRAND_COLOR}40`, bgcolor: '#fffbfb' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle2" fontWeight={800} color="error" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Action Required</Typography>
                  <Button variant="outlined" color="inherit" size="small" onClick={() => window.print()} startIcon={<LocalPrintshopIcon />}>พิมพ์ใบเสร็จ</Button>
                </Stack>
                
                <Grid container spacing={2}>
                  {/* ปุ่มสำหรับ Pending: รับออเดอร์ */}
                  {order.orderStatus === Sd.Status_Pending && (
                      <Grid size={{xs: 12}}>
                          <Button fullWidth variant="contained" color="warning" size="large" onClick={() => handleStatusChange(Sd.Status_Approved)} disabled={isLoading} sx={{ py: 1.5, borderRadius: 2 }} startIcon={<CheckCircleIcon />}>
                              รับออเดอร์ (Accept Order)
                          </Button>
                      </Grid>
                  )}

                  {/* ปุ่มสำหรับ PendingPayment: ยืนยันจ่าย */}
                  {order.orderStatus === Sd.Status_PendingPayment && (
                      <Grid size={{xs: 12}}>
                          <Button fullWidth variant="contained" color="error" size="large" onClick={() => handleStatusChange(Sd.Status_Paid)} disabled={isLoading} sx={{ py: 1.5, borderRadius: 2 }} startIcon={<PaidIcon />}>
                              ยืนยันการชำระเงิน (Confirm Payment)
                          </Button>
                      </Grid>
                  )}

                  {/* ปุ่มสำหรับ Paid หรือ Approved: ส่งเข้าครัว */}
                  {(order.orderStatus === Sd.Status_Paid || order.orderStatus === Sd.Status_Approved) && (
                    <Grid size={{xs: 12}}>
                        <Button fullWidth variant="contained" size="large" onClick={() => handleStatusChange(Sd.Status_Preparing)} disabled={isLoading} startIcon={<PlayArrowIcon />} sx={{ bgcolor: '#1976d2', py: 1.5, borderRadius: 2 }}>
                            เริ่มปรุงอาหาร (Start Cooking)
                        </Button>
                    </Grid>
                  )}

                  {/* ปุ่มสำหรับ Preparing: เสร็จแล้ว */}
                  {order.orderStatus === Sd.Status_Preparing && (
                    <Grid size={{xs: 12}}>
                        <Button fullWidth variant="contained" color="success" size="large" onClick={() => handleStatusChange(Sd.Status_Ready)} disabled={isLoading} startIcon={<CheckCircleIcon />} sx={{ py: 1.5, borderRadius: 2 }}>
                            ปรุงเสร็จแล้ว (Kitchen Done)
                        </Button>
                    </Grid>
                  )}

                  {/* ปุ่มสำหรับ Ready: จบงาน */}
                  {order.orderStatus === Sd.Status_Ready && (
                    <Grid size={{xs: 12}}>
                        <Button fullWidth variant="contained" color="info" size="large" onClick={() => handleStatusChange(Sd.Status_Completed)} disabled={isLoading} startIcon={<TakeoutDiningIcon />} sx={{ py: 1.5, borderRadius: 2 }}>
                            ส่งมอบเรียบร้อย (Complete)
                        </Button>
                    </Grid>
                  )}

                  {/* ปุ่มยกเลิก (แสดงตลอด ยกเว้นจบแล้ว) */}
                  {![Sd.Status_Completed, Sd.Status_Cancelled].includes(order.orderStatus) && (
                      <Grid size={{xs: 12}}>
                          <Button fullWidth size="small" color="error" variant="text" onClick={handleOpenCancelOrder}>
                              ยกเลิกออเดอร์นี้ (Cancel Order)
                          </Button>
                      </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* ... (ส่วน Customer Info และ Order Items เหมือนเดิมเป๊ะ ไม่ต้องแก้) ... */}
          {/* ... (Copy โค้ดส่วนเดิมมาใส่ตรงนี้ได้เลย) ... */}
          
          {/* Customer Info */}
          <Grid container spacing={3}>
            <Grid size={{xs: 12}}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PersonIcon color="action" /> ข้อมูลลูกค้า</Typography>
                    {!isEditing && order.orderStatus !== Sd.Status_Cancelled && ( <IconButton size="small" onClick={() => setIsEditing(true)} sx={{ bgcolor: '#f5f5f5' }}><EditIcon fontSize="small" /></IconButton> )}
                  </Stack>
                  {isEditing ? (
                    <Stack spacing={2}>
                      <TextField label="ชื่อลูกค้า" size="small" fullWidth value={editForm.customerName} onChange={(e) => setEditForm({...editForm, customerName: e.target.value})} />
                      <TextField label="เบอร์โทร" size="small" fullWidth value={editForm.customerPhone} onChange={(e) => setEditForm({...editForm, customerPhone: e.target.value})} />
                      <TextField label="Note" size="small" fullWidth multiline rows={2} value={editForm.note} onChange={(e) => setEditForm({...editForm, note: e.target.value})} />
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" onClick={() => setIsEditing(false)}>ยกเลิก</Button>
                        <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSaveEdit} disabled={isLoading}>บันทึก</Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={2} alignItems="center"><Typography variant="body2" color="text.secondary" minWidth={60}>ชื่อ:</Typography><Typography variant="body1" fontWeight={500}>{order.customerName || "Walk-in"}</Typography></Stack>
                      <Divider variant="inset" component="div" />
                      <Stack direction="row" spacing={2} alignItems="center"><Typography variant="body2" color="text.secondary" minWidth={60}>โทร:</Typography><Stack direction="row" alignItems="center" gap={1}><PhoneIcon fontSize="small" color="disabled" /><Typography variant="body1">{order.customerPhone || "-"}</Typography></Stack></Stack>
                      {order.customerNote && (<Alert severity="warning" icon={false} sx={{ mt: 1, borderRadius: 2 }}><strong>Note:</strong> {order.customerNote}</Alert>)}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* ✅ Order Items (พร้อมปุ่มเปลี่ยนสถานะแบบ Menu) */}
            <Grid size={{xs: 12}}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ p: 2, bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><RestaurantMenuIcon color="action" /> รายการอาหาร ({order.orderDetails.length})</Typography>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      {order.orderDetails.map((item) => {
                        const statusInfo = getItemStatusInfo(item.kitchenStatus);
                        return (
                        <Box key={item.id} sx={{ mb: 2, pb: 2, borderBottom: "1px dashed #eee", '&:last-child': { borderBottom: 0, pb: 0, mb: 0 }, opacity: item.isCancelled ? 0.5 : 1 }}>
                           <Stack direction="row" spacing={2}>
                              <Avatar variant="rounded" src={item.menuItemImage} sx={{ width: 64, height: 64, bgcolor: '#eee' }}><RestaurantMenuIcon color="disabled" /></Avatar>
                              <Box sx={{ flex: 1 }}>
                                 <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box>
                                       <Typography variant="body1" fontWeight={700} sx={{ color: item.isCancelled ? 'error.main' : '#333', textDecoration: item.isCancelled ? 'line-through' : 'none' }}>
                                           {item.menuItemName} {item.isCancelled && "(ยกเลิก)"}
                                       </Typography>
                                       {item.orderDetailOptions.map((opt) => (
                                          <Typography key={opt.id} variant="caption" color="text.secondary" display="block">+ {opt.optionValueName}</Typography>
                                       ))}
                                    </Box>
                                    <Typography variant="body1" fontWeight={700}>฿{item.totalPrice.toLocaleString()}</Typography>
                                 </Stack>
                                 
                                 {!item.isCancelled && (
                                     <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                                         <Chip label={`${item.quantity} ชิ้น`} size="small" sx={{ borderRadius: 1, bgcolor: '#eceff1', fontWeight: 600 }} />
                                         
                                         {/* ✅ ปุ่มเปิด Menu เลือกสถานะ */}
                                         <Button
                                             size="small"
                                             variant="outlined"
                                             onClick={(e) => handleOpenStatusMenu(e, item.id)}
                                             endIcon={<KeyboardArrowDownIcon />}
                                             sx={{ 
                                                 borderRadius: 4, 
                                                 textTransform: 'none', 
                                                 fontSize: '0.75rem', 
                                                 py: 0.2,
                                                 borderColor: statusInfo.bg,
                                                 bgcolor: statusInfo.bg,
                                                 color: statusInfo.text,
                                                 fontWeight: 700,
                                                 '&:hover': { bgcolor: statusInfo.bg, filter: 'brightness(0.95)' }
                                             }}
                                         >
                                             {statusInfo.label}
                                         </Button>

                                         {/* ปุ่มยกเลิกรายจาน */}
                                         {order.orderStatus !== Sd.Status_Completed && order.orderStatus !== Sd.Status_Cancelled && (
                                             <Tooltip title="ยกเลิกเมนูนี้">
                                                 <IconButton 
                                                     size="small" 
                                                     color="error" 
                                                     onClick={() => handleOpenCancelItem(item.id, item.menuItemName)}
                                                     sx={{ border: '1px solid #ef5350', p: 0.5 }}
                                                 >
                                                     <DeleteForeverIcon fontSize="small" />
                                                 </IconButton>
                                             </Tooltip>
                                         )}
                                     </Stack>
                                 )}
                              </Box>
                           </Stack>
                        </Box>
                        );
                      })}
                    </Box>
                    <Box sx={{ p: 3, bgcolor: '#fffbfb', borderTop: '2px dashed #eee' }}>
                      <Stack spacing={1}>
                          <Stack direction="row" justifyContent="space-between"><Typography variant="body2" color="text.secondary">รวมค่าอาหาร</Typography><Typography variant="body2" fontWeight={600}>฿{order.subTotal.toLocaleString()}</Typography></Stack>
                          <Divider sx={{ my: 1 }} />
                          <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="h6" fontWeight={700} color="text.primary">ยอดสุทธิ</Typography><Typography variant="h4" fontWeight={800} sx={{ color: BRAND_COLOR }}>฿{order.total.toLocaleString()}</Typography></Stack>
                      </Stack>
                    </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </Drawer>

    {/* ... (Menu และ Dialog คงเดิม) ... */}
    <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseStatusMenu}
        PaperProps={{ sx: { borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" } }}
    >
        <MenuItem onClick={() => handleChangeItemStatus(Sd.KDS_Waiting)}>
            <ListItemIcon><HourglassEmptyIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="รอคิว (Waiting)" />
        </MenuItem>
        <MenuItem onClick={() => handleChangeItemStatus(Sd.KDS_Cooking)}>
            <ListItemIcon sx={{ color: '#e65100' }}><SoupKitchenIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="กำลังปรุง (Cooking)" sx={{ color: '#e65100' }} />
        </MenuItem>
        <MenuItem onClick={() => handleChangeItemStatus(Sd.KDS_Done)}>
            <ListItemIcon sx={{ color: '#2e7d32' }}><CheckCircleIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="เสร็จแล้ว (Done)" sx={{ color: '#2e7d32' }} />
        </MenuItem>
    </Menu>

    <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle sx={{ color: '#d32f2f', fontWeight: 700 }}>
            {targetItemId ? `ยกเลิกเมนู "${targetItemName}"?` : "ยกเลิกออเดอร์ทั้งหมด?"}
        </DialogTitle>
        <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
                {targetItemId 
                    ? "คุณต้องการยกเลิกรายการอาหารนี้ใช่หรือไม่? ยอดเงินจะถูกคำนวณใหม่" 
                    : "การกระทำนี้ไม่สามารถย้อนกลับได้ กรุณาระบุเหตุผล (Optional)"}
            </DialogContentText>
            <TextField autoFocus margin="dense" label="เหตุผลการยกเลิก" fullWidth variant="outlined" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setCancelDialogOpen(false)} color="inherit">ปิด</Button>
            <Button onClick={handleConfirmCancel} variant="contained" color="error" disabled={isLoading}>ยืนยันการยกเลิก</Button>
        </DialogActions>
    </Dialog>
    </>
  );
}