/* eslint-disable @typescript-eslint/no-unused-vars */
 
import { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Stack,
  Typography,
  IconButton,
  Divider,
  Avatar,
  Paper,
  Button,
  TextField,
  Chip,
  Alert,
  Tooltip,
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
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen';

// Types & API
import type { OrderHeader } from "../../../../@types/dto/OrderHeader";
import {
  useUpdateOrderStatusMutation,
  useUpdateOrderMutation,
  useCancelOrderMutation,
  useUpdateKitchenStatusMutation,
} from "../../../../services/orderApi";

type Props = {
  open: boolean;
  onClose: () => void;
  order: OrderHeader | null;
};

export default function OrderDetailDrawer({ open, onClose, order }: Props) {
  // --- API Hooks ---
  const [updateStatus, { isLoading: loadingStatus }] = useUpdateOrderStatusMutation();
  const [updateOrder, { isLoading: loadingUpdate }] = useUpdateOrderMutation();
  const [cancelOrder, { isLoading: loadingCancel }] = useCancelOrderMutation();
  const [updateKitchen, { isLoading: loadingKitchen }] = useUpdateKitchenStatusMutation();

  const isLoading = loadingStatus || loadingUpdate || loadingCancel || loadingKitchen;

  // --- Local States ---
  // 1. สำหรับโหมดแก้ไขข้อมูลลูกค้า
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ customerName: "", customerPhone: "", note: "" });

  // 2. สำหรับโหมดการยกเลิก
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Sync State เมื่อเปิด Drawer หรือ Order เปลี่ยน
  useEffect(() => {
    if (order) {
      setEditForm({
        customerName: order.customerName || "",
        customerPhone: order.customerPhone || "",
        note: order.customerNote || "",
      });
      setIsEditing(false);
      setIsCancelling(false);
      setCancelReason("");
    }
  }, [order, open]);

  if (!order) return null;

  // --- Handlers ---

  // 1. เปลี่ยนสถานะออเดอร์ (Workflow)
  const handleStatusChange = async (nextStatus: string) => {
    try {
      await updateStatus({ id: order.id, newStatus: nextStatus }).unwrap();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  };

  // 2. บันทึกการแก้ไขข้อมูล (Edit Info)
  const handleSaveEdit = async () => {
    try {
      await updateOrder({
        id: order.id,
        customerName: editForm.customerName,
        customerPhone: editForm.customerPhone,
        customerNote: editForm.note,
        // ❌ เอา discount ออกแล้ว
      }).unwrap();
      setIsEditing(false);
    } catch (err) {
      alert("บันทึกข้อมูลไม่สำเร็จ");
    }
  };

  // 3. ยกเลิกออเดอร์ (Cancel)
  const handleConfirmCancel = async () => {
    if (!cancelReason.trim()) return alert("กรุณาระบุเหตุผลการยกเลิก");
    try {
      await cancelOrder({
        id: order.id,
        request: { reason: cancelReason },
      }).unwrap();
      setIsCancelling(false);
      onClose();
    } catch (err) {
      alert("ยกเลิกออเดอร์ไม่สำเร็จ");
    }
  };

  // 4. อัปเดตสถานะรายเมนู (Kitchen Item Status)
  const handleItemStatusToggle = async (detailId: number, currentStatus: string) => {
    const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";
    try {
        await updateKitchen({ detailId, status: newStatus }).unwrap();
    } catch (err) {
        console.error(err);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 550 }, bgcolor: "#f8f9fa" } }}
    >
      {/* === Header === */}
      <Box sx={{ p: 2, bgcolor: "white", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eee" }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: "primary.main" }}>
            <ReceiptLongIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800} lineHeight={1}>
              {order.orderCode}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
               <Chip label={order.orderStatus} size="small" color={order.orderStatus === 'Ready' ? 'success' : 'default'} />
               <Typography variant="caption" color="text.secondary">
                 PickUp: {order.pickUpCode || "-"}
               </Typography>
            </Stack>
          </Box>
        </Stack>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* === Content === */}
      <Box sx={{ p: 3, flex: 1, overflowY: "auto" }}>
        <Stack spacing={3}>
          
          {/* --- Section 1: Workflow Actions --- */}
          {order.orderStatus !== "Cancelled" && (
            <Paper sx={{ p: 2, borderRadius: 3, border: "1px solid", borderColor: "primary.light", bgcolor: "white" }}>
              <Typography variant="subtitle2" fontWeight={700} color="primary" gutterBottom>
                จัดการสถานะ (Workflow)
              </Typography>
              
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                {order.orderStatus === "PendingPayment" && (
                   <Button variant="contained" color="warning" onClick={() => handleStatusChange("Paid")} disabled={isLoading}>
                      ยืนยันการชำระเงิน
                   </Button>
                )}
                
                {(order.orderStatus === "Paid") && (
                  <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={() => handleStatusChange("Preparing")} disabled={isLoading}>
                    เริ่มปรุงอาหาร
                  </Button>
                )}

                {order.orderStatus === "Preparing" && (
                  <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleStatusChange("Ready")} disabled={isLoading}>
                    ปรุงเสร็จแล้ว
                  </Button>
                )}

                {order.orderStatus === "Ready" && (
                  <Button variant="contained" color="info" startIcon={<TakeoutDiningIcon />} onClick={() => handleStatusChange("Completed")} disabled={isLoading}>
                    ส่งมอบแล้ว (จบงาน)
                  </Button>
                )}

                <Button variant="outlined" color="inherit" onClick={() => window.print()} sx={{ minWidth: 40 }}>
                   <LocalPrintshopIcon />
                </Button>
              </Stack>

              {!isCancelling && !["Completed", "Cancelled"].includes(order.orderStatus) && (
                 <Button 
                    size="small" 
                    color="error" 
                    sx={{ mt: 2 }} 
                    onClick={() => setIsCancelling(true)}
                 >
                    ยกเลิกออเดอร์นี้...
                 </Button>
              )}

              {isCancelling && (
                <Box sx={{ mt: 2, p: 2, bgcolor: "#ffebee", borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="error" fontWeight={700} gutterBottom>
                    ยืนยันการยกเลิกออเดอร์
                  </Typography>
                  <TextField 
                    fullWidth 
                    size="small" 
                    placeholder="ระบุเหตุผล (เช่น ลูกค้าขอยกเลิก, วัตถุดิบหมด)" 
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    sx={{ bgcolor: "white", mb: 1 }}
                  />
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button size="small" color="inherit" onClick={() => setIsCancelling(false)}>กลับ</Button>
                    <Button size="small" variant="contained" color="error" onClick={handleConfirmCancel} disabled={isLoading}>
                      ยืนยันยกเลิก
                    </Button>
                  </Stack>
                </Box>
              )}
            </Paper>
          )}

          {/* --- Section 2: Customer Info (Editable) --- */}
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2" fontWeight={800}>ข้อมูลลูกค้า</Typography>
              {!isEditing && order.orderStatus !== "Cancelled" && (
                <IconButton size="small" onClick={() => setIsEditing(true)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>

            {isEditing ? (
              <Stack spacing={2}>
                <TextField 
                  label="ชื่อลูกค้า" size="small" fullWidth 
                  value={editForm.customerName}
                  onChange={(e) => setEditForm({...editForm, customerName: e.target.value})}
                />
                <TextField 
                  label="เบอร์โทร" size="small" fullWidth 
                  value={editForm.customerPhone}
                  onChange={(e) => setEditForm({...editForm, customerPhone: e.target.value})}
                />
                <TextField 
                  label="Note" size="small" fullWidth multiline rows={2}
                  value={editForm.note}
                  onChange={(e) => setEditForm({...editForm, note: e.target.value})}
                />
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" onClick={() => setIsEditing(false)}>ยกเลิก</Button>
                  <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={handleSaveEdit} disabled={isLoading}>
                    บันทึก
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={1}>
                <Typography variant="body2">
                    <strong>ชื่อ:</strong> {order.customerName || "-"}
                </Typography>
                <Typography variant="body2">
                    <strong>โทร:</strong> {order.customerPhone || "-"}
                </Typography>
                {order.customerNote && (
                    <Alert severity="info" sx={{ py: 0, px: 1, fontSize: "0.85rem" }}>
                        Note: {order.customerNote}
                    </Alert>
                )}
              </Stack>
            )}
          </Paper>

          {/* --- Section 3: Items List --- */}
          <Paper sx={{ p: 2, borderRadius: 3 }}>
             <Typography variant="subtitle2" fontWeight={800} gutterBottom>รายการสินค้า</Typography>
             {order.orderDetails.map((item) => (
                <Box key={item.id} sx={{ mb: 2, pb: 1, borderBottom: "1px dashed #eee" }}>
                   <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ flex: 1 }}>
                         <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="body2" fontWeight={700}>
                               {item.quantity}x {item.menuItemName}
                            </Typography>
                            
                            <Tooltip title={`ครัว: ${item.kitchenStatus || 'Pending'}`} arrow>
                                <IconButton 
                                    size="small" 
                                    color={item.kitchenStatus === 'Completed' ? 'success' : 'default'}
                                    onClick={() => handleItemStatusToggle(item.id, item.kitchenStatus)}
                                    disabled={isLoading}
                                    sx={{ p: 0.5 }}
                                >
                                    <SoupKitchenIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                         </Stack>
                         
                         {item.orderDetailOptions.map((opt) => (
                            <Typography key={opt.id} variant="caption" color="text.secondary" display="block" sx={{ ml: 2 }}>
                               • {opt.optionValueName}
                            </Typography>
                         ))}
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                         ฿{item.totalPrice.toLocaleString()}
                      </Typography>
                   </Stack>
                </Box>
             ))}
          </Paper>

          {/* --- Section 4: Summary --- */}
          <Paper sx={{ p: 2, bgcolor: "grey.50", borderRadius: 3 }}>
             <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                   <Typography variant="body2" color="text.secondary">ยอดรวมสินค้า</Typography>
                   <Typography variant="body2">฿{order.subTotal.toLocaleString()}</Typography>
                </Stack>
                {/* ❌ เอาส่วนแสดงผล Discount ออกแล้วครับ */}
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                   <Typography variant="subtitle1" fontWeight={800}>ยอดสุทธิ</Typography>
                   <Typography variant="h6" fontWeight={900} color="primary">฿{order.total.toLocaleString()}</Typography>
                </Stack>
             </Stack>
          </Paper>

        </Stack>
      </Box>
    </Drawer>
  );
}