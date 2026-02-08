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
  
  // ✅ เพิ่มฟังก์ชันกด Enter แล้วส่งเลย
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCancelling) {
      e.preventDefault(); // กันไม่ให้ขึ้นบรรทัดใหม่
      onConfirm();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={isCancelling ? undefined : onClose} // กันปิด Dialog ตอนกำลัง Loading
      fullWidth 
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: 4, p: 1 } }} // เพิ่ม Padding รอบ Dialog นิดหน่อย
    >
      <Box sx={{ textAlign: 'center', pt: 2, px: 2 }}>
        <Box 
            sx={{ 
                bgcolor: '#FFEBEE', // พื้นหลังสีแดงอ่อนๆ รองไอคอน
                width: 60, height: 60, 
                borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 2
            }}
        >
            <WarningAmberRoundedIcon color="error" sx={{ fontSize: 36 }} />
        </Box>
        
        <DialogTitle sx={{ p: 0, fontWeight: 800, fontSize: '1.25rem' }}>
          {targetItem ? "ลบรายการอาหาร?" : "ยกเลิกออเดอร์?"}
        </DialogTitle>
      </Box>

      <DialogContent sx={{ pb: 1 }}>
        <DialogContentText sx={{ textAlign: 'center', mb: 2, color: 'text.secondary' }}>
          {targetItem ? (
            <span>
              ยืนยันที่จะลบ <Typography component="span" fontWeight={700} color="error.main">{targetItem.name}</Typography> <br/> ออกจากรายการสั่งซื้อ?
            </span>
          ) : (
            "รายการอาหารทั้งหมดจะถูกยกเลิกทันที และคุณจะต้องเริ่มสั่งใหม่"
          )}
        </DialogContentText>
        
        <TextField
          autoFocus
          margin="dense"
          label="ระบุเหตุผล (ถ้ามี)"
          placeholder={targetItem ? "เช่น สั่งผิด, เปลี่ยนใจ" : "เช่น รอนาน, เปลี่ยนร้าน"}
          fullWidth
          variant="outlined"
          size="small"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onKeyDown={handleKeyDown} // ✅ ผูก Event Enter
          disabled={isCancelling}
          sx={{ 
            mt: 1,
            '& .MuiOutlinedInput-root': { borderRadius: 2 }
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1, justifyContent: 'space-between' }}>
        <Button 
            onClick={onClose} 
            color="inherit" 
            variant="outlined" 
            sx={{ borderRadius: 2, px: 3, width: '45%', border: '1px solid #ddd', color: '#666' }}
            disabled={isCancelling}
        >
            ยกเลิก
        </Button>
        <Button 
            onClick={onConfirm} 
            variant="contained" 
            color="error" 
            disabled={isCancelling}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700, boxShadow: 'none', width: '45%' }}
        >
          {isCancelling ? "รอสักครู่..." : "ยืนยัน"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}