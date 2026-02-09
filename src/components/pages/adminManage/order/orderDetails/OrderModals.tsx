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
}: Props) {
  return (
    <>
      {/* Menu Status */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onCloseMenu}
        PaperProps={{
          sx: { borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" },
        }}
      >
        <MenuItem onClick={() => onChangeItemStatus(Sd.KDS_Waiting)}>
          <ListItemIcon>
            <HourglassEmptyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="รอคิว (Waiting)" />
        </MenuItem>
        <MenuItem onClick={() => onChangeItemStatus(Sd.KDS_Cooking)}>
          <ListItemIcon sx={{ color: "#e65100" }}>
            <SoupKitchenIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="กำลังปรุง (Cooking)"
            sx={{ color: "#e65100" }}
          />
        </MenuItem>
        <MenuItem onClick={() => onChangeItemStatus(Sd.KDS_Done)}>
          <ListItemIcon sx={{ color: "#2e7d32" }}>
            <CheckCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="เสร็จแล้ว (Done)" sx={{ color: "#2e7d32" }} />
        </MenuItem>
      </Menu>

      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle sx={{ color: "#d32f2f", fontWeight: 700 }}>
          {targetItemId
            ? `ยกเลิกเมนู "${targetItemName}"?`
            : "ยกเลิกออเดอร์ทั้งหมด?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {targetItemId
              ? "คุณต้องการยกเลิกรายการอาหารนี้ใช่หรือไม่? ยอดเงินจะถูกคำนวณใหม่"
              : "การกระทำนี้ไม่สามารถย้อนกลับได้ กรุณาระบุเหตุผล (Optional)"}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="เหตุผลการยกเลิก"
            fullWidth
            variant="outlined"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCancelDialogOpen(false)} color="inherit">
            ปิด
          </Button>
          <Button
            onClick={onConfirmCancel}
            variant="contained"
            color="error"
            disabled={isLoading}
          >
            ยืนยันการยกเลิก
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
