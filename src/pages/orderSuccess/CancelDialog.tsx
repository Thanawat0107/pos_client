import { Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button, Box, Typography } from "@mui/material";
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isCancelling: boolean;
  targetItem: { id: number; name: string } | null;
  reason: string;
  setReason: (val: string) => void;
}

export default function CancelDialog({ open, onClose, onConfirm, isCancelling, targetItem, reason, setReason }: Props) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth 
      maxWidth="xs" // ✅ จัดให้พอดีมือถือ ไม่กว้าง/แคบไป
      PaperProps={{ sx: { borderRadius: 3 } }} // มุมมนสวยงาม
    >
      <Box sx={{ textAlign: 'center', pt: 3, px: 2 }}>
        <WarningAmberRoundedIcon color="error" sx={{ fontSize: 48, mb: 1, opacity: 0.8 }} />
        
        <DialogTitle sx={{ p: 0, fontWeight: 800 }}>
          {targetItem ? "ยืนยันลบรายการ?" : "ยกเลิกออเดอร์?"}
        </DialogTitle>
      </Box>

      <DialogContent>
        <DialogContentText sx={{ textAlign: 'center', mb: 2, color: 'text.primary' }}>
          {targetItem ? (
            <span>
              คุณต้องการลบรายการ <Typography component="span" fontWeight={700} color="error">{targetItem.name}</Typography> ออกจากออเดอร์ใช่หรือไม่?
            </span>
          ) : (
            "รายการอาหารทั้งหมดจะถูกยกเลิกทันที คุณแน่ใจหรือไม่?"
          )}
        </DialogContentText>
        
        {/* ✅ เปิดให้ใส่เหตุผลได้ทั้ง 2 กรณี (เพื่อเก็บ Data) */}
        <TextField
          autoFocus
          margin="dense"
          label="ระบุเหตุผล (ไม่บังคับ)"
          placeholder="เช่น เปลี่ยนใจ, สั่งผิด"
          fullWidth
          variant="outlined"
          size="small"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={{ mt: 1 }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 1 }}>
        <Button 
            onClick={onClose} 
            color="inherit" 
            variant="text" 
            sx={{ borderRadius: 2, px: 3 }}
            disabled={isCancelling}
        >
            ปิด
        </Button>
        <Button 
            onClick={onConfirm} 
            variant="contained" 
            color="error" 
            disabled={isCancelling}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700, boxShadow: 'none' }}
        >
          {isCancelling ? "กำลังดำเนินการ..." : "ยืนยันการยกเลิก"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}