import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isCancelling: boolean;
  targetItem: { id: number; name: string } | null;
  reason: string;
  setReason: (val: string) => void;
}

export default function CancelDialog({
  open,
  onClose,
  onConfirm,
  isCancelling,
  targetItem,
  reason,
  setReason,
}: Props) {
  // ✅ Handle Enter Key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isCancelling) {
      // ถ้าไม่มีเหตุผล และอยากจะบังคับ (Optional)
      // if (reason.trim().length === 0) return;

      e.preventDefault();
      onConfirm();
    }
  };

  return (
    <Dialog
      open={open}
      // ป้องกันการปิดโดยไม่ตั้งใจ (คลิกพื้นหลังหรือกด Esc) ขณะที่กำลังส่งข้อมูล
      onClose={isCancelling ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 1,
          backgroundImage: "none", // สำหรับ Dark Mode
        },
      }}
    >
      <Box sx={{ textAlign: "center", pt: 3, px: 2 }}>
        <Box
          sx={{
            bgcolor: "#FFF4E5", // เปลี่ยนเป็นสีส้มอ่อนให้ดูเป็น Warning มากกว่า Error รุนแรง
            width: 70,
            height: 70,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
            // เพิ่ม Animation เล็กน้อยตอนเปิด
            transition: "transform 0.3s ease-in-out",
            "&:hover": { transform: "rotate(10deg)" },
          }}
        >
          <WarningAmberRoundedIcon color="warning" sx={{ fontSize: 42 }} />
        </Box>

        <DialogTitle
          sx={{ p: 0, fontWeight: 900, fontSize: "1.4rem", color: "#333" }}
        >
          {targetItem ? "ลบรายการอาหาร?" : "ยกเลิกออเดอร์นี้?"}
        </DialogTitle>
      </Box>

      <DialogContent sx={{ pb: 1, mt: 1 }}>
        <DialogContentText
          sx={{
            textAlign: "center",
            mb: 3,
            color: "text.secondary",
            fontSize: "0.95rem",
          }}
        >
          {targetItem ? (
            <>
              ยืนยันที่จะลบรายการ{" "}
              <Typography component="span" fontWeight={800} color="error.main">
                {targetItem.name}
              </Typography>{" "}
              <br /> ออกจากรายการสั่งซื้อหรือไม่?
            </>
          ) : (
            "รายการอาหารทั้งหมดจะถูกยกเลิก และระบบจะคืนสิทธิ์โปรโมชั่น (หากยังไม่หมดอายุ)"
          )}
        </DialogContentText>

        <TextField
          autoFocus
          margin="dense"
          label="เหตุผลในการยกเลิก"
          placeholder={
            targetItem
              ? "เช่น สั่งผิด, ต้องการเปลี่ยนเมนู"
              : "เช่น รอนานเกินไป, เปลี่ยนใจ"
          }
          fullWidth
          variant="filled" // เปลี่ยนเป็น Filled เพื่อให้ดูต่างจากหน้าสั่งอาหารปกติ
          size="small"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isCancelling}
          sx={{
            mt: 1,
            "& .MuiFilledInput-root": {
              borderRadius: "8px 8px 0 0",
              bgcolor: "#f9f9f9",
            },
          }}
        />
      </DialogContent>

      <DialogActions
        sx={{ px: 3, pb: 3, pt: 1, justifyContent: "space-between", gap: 2 }}
      >
        <Button
          onClick={onClose}
          fullWidth
          color="inherit"
          variant="text"
          disabled={isCancelling}
          sx={{
            borderRadius: 3,
            fontWeight: 700,
            color: "#999",
            textTransform: "none",
          }}
        >
          กลับไป
        </Button>

        <Button
          onClick={onConfirm}
          fullWidth
          variant="contained"
          color="error"
          disabled={isCancelling}
          sx={{
            borderRadius: 3,
            py: 1.2,
            fontWeight: 800,
            boxShadow: "0 4px 12px rgba(211, 47, 47, 0.2)",
            textTransform: "none",
            fontSize: "1rem",
          }}
        >
          {isCancelling ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "ยืนยันยกเลิก"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}