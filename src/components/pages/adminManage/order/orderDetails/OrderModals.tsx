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
        onClose={() => !isLoading && setCancelDialogOpen(false)} // กันคนกดปิดตอนกำลังคุยกับ Server
      >
        <DialogTitle sx={{ color: "#d32f2f", fontWeight: 800, px: 3, pt: 3 }}>
          {targetItemId
            ? `ยกเลิกเมนู "${targetItemName}"`
            : "⚠️ ยกเลิกออเดอร์ทั้งหมด"}
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <DialogContentText sx={{ mb: 2, fontSize: "0.95rem" }}>
            {targetItemId
              ? "รายการนี้จะถูกตัดออกจากบิล และยอดเงินรวมจะถูกคำนวณใหม่โดยอัตโนมัติ"
              : "คำสั่งซื้อนี้จะถูกระงับการทำงานทั้งหมด โปรดระบุเหตุผลเพื่อเป็นหลักฐาน"}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label={
              targetItemId ? "เหตุผล (ไม่บังคับ)" : "เหตุผลการยกเลิก (บังคับ)"
            } // ปรับ Label ตามบริบท
            fullWidth
            variant="outlined"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            disabled={isLoading}
            multiline
            rows={2} // ให้พิมพ์สะดวกขึ้น
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setCancelDialogOpen(false)}
            color="inherit"
            disabled={isLoading}
          >
            ย้อนกลับ
          </Button>
          <Button
            onClick={onConfirmCancel}
            variant="contained"
            color="error"
            // ✅ บังคับใส่เหตุผลถ้าเป็นการยกเลิกทั้งออเดอร์
            disabled={isLoading || (!targetItemId && !cancelReason.trim())}
            sx={{ fontWeight: 700, px: 3 }}
          >
            ยืนยันยกเลิก
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
