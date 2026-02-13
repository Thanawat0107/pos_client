 import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Sd } from "../../../../../helpers/SD";

type Props = {
  cancelDialogOpen: boolean;
  setCancelDialogOpen: (open: boolean) => void;
  targetItemId: number | null;
  targetItemName: string;
  cancelReason: string;
  setCancelReason: (val: string) => void;
  onConfirmCancel: () => void;
  isLoading: boolean;
  anchorEl: HTMLElement | null;
  onCloseMenu: () => void;
  onChangeItemStatus: (status: string) => void;
  // ✅ เพิ่ม Prop นี้เพื่อเช็คสถานะปัจจุบันของจานที่เลือก
  currentItemStatus?: string; 
};

export default function OrderModals({
  cancelDialogOpen,
  setCancelDialogOpen,
  targetItemId,
  targetItemName,
  cancelReason,
  setCancelReason,
  onConfirmCancel,
  isLoading,
  anchorEl,
  onCloseMenu,
  onChangeItemStatus,
  currentItemStatus,
}: Props) {
  
  return (
    <>
      {/* Menu Status: ปรับสถานะรายจาน */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onCloseMenu}
        PaperProps={{
          sx: { borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", minWidth: 180 },
        }}
      >
        <MenuItem 
          onClick={() => onChangeItemStatus(Sd.KDS_Waiting)}
          disabled={currentItemStatus === Sd.KDS_Waiting}
        >
          <ListItemIcon><HourglassEmptyIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="รอคิว (Waiting)" />
        </MenuItem>

        <MenuItem 
          onClick={() => onChangeItemStatus(Sd.KDS_Cooking)}
          disabled={currentItemStatus === Sd.KDS_Cooking}
          sx={{ color: "#e65100" }}
        >
          <ListItemIcon sx={{ color: "#e65100" }}><SoupKitchenIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="กำลังปรุง (Cooking)" />
        </MenuItem>

        <MenuItem 
          onClick={() => onChangeItemStatus(Sd.KDS_Done)}
          disabled={currentItemStatus === Sd.KDS_Done}
          sx={{ color: "#2e7d32" }}
        >
          <ListItemIcon sx={{ color: "#2e7d32" }}><CheckCircleIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="เสร็จแล้ว (Done)" />
        </MenuItem>
      </Menu>

      {/* Cancel Dialog: ยกเลิกออเดอร์ หรือ ยกเลิกบางจาน */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => !isLoading && setCancelDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ color: "#d32f2f", fontWeight: 900, fontSize: '1.4rem', pt: 3 }}>
          {targetItemId ? "ลบรายการอาหาร?" : "⚠️ ยกเลิกออเดอร์ทั้งหมด?"}
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ mb: 3, color: "text.secondary", fontWeight: 500 }}>
            {targetItemId
              ? (
                <>
                  ยืนยันการลบ <strong>"{targetItemName}"</strong> <br />
                  ยอดเงินรวมจะถูกคำนวณใหม่ และสถานะออเดอร์แม่จะถูกอัปเดตอัตโนมัติ
                </>
              )
              : "คำสั่งซื้อนี้จะถูกยกเลิกถาวรและไม่สามารถกู้คืนได้ โปรดระบุเหตุผลเพื่อบันทึกลงระบบ"}
          </DialogContentText>

          <TextField
            autoFocus
            margin="dense"
            label="ระบุเหตุผลการยกเลิก"
            placeholder="เช่น สั่งผิด, ของหมด, ลูกค้าเปลี่ยนใจ"
            fullWidth
            variant="filled"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            disabled={isLoading}
            multiline
            rows={2}
            error={!cancelReason.trim()} // Show error if empty
            helperText={!cancelReason.trim() ? "กรุณาระบุเหตุผลเพื่อยืนยัน" : ""}
            sx={{ "& .MuiFilledInput-root": { borderRadius: 2 } }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1.5 }}>
          <Button
            onClick={() => setCancelDialogOpen(false)}
            color="inherit"
            disabled={isLoading}
            sx={{ fontWeight: 700 }}
          >
            ย้อนกลับ
          </Button>
          
          <Button
            onClick={onConfirmCancel}
            variant="contained"
            color="error"
            // ✅ บังคับใส่เหตุผลทุกกรณี (เพื่อความปลอดภัยของข้อมูลบัญชี)
            disabled={isLoading || !cancelReason.trim()}
            sx={{ 
              fontWeight: 800, 
              px: 4, 
              py: 1, 
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)'
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "ยืนยันยกเลิก"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}