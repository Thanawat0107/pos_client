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
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isCancelling) {
      e.preventDefault();
      onConfirm();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isCancelling ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 5, // ปรับให้มนเท่ากับ Card ส่วนอื่น
          p: { xs: 1, sm: 2 },
          backgroundImage: "none",
        },
      }}
    >
      <Box sx={{ textAlign: "center", pt: 4, px: 2 }}>
        <Box
          sx={{
            bgcolor: "#FFF4E5",
            width: { xs: 70, sm: 80 },
            height: { xs: 70, sm: 80 },
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2.5,
            transition: "transform 0.3s ease-in-out",
            "&:hover": { transform: "rotate(10deg)" },
          }}
        >
          <WarningAmberRoundedIcon color="warning" sx={{ fontSize: { xs: 42, sm: 48 } }} />
        </Box>

        <DialogTitle
          sx={{ 
            p: 0, 
            fontWeight: 900, 
            fontSize: { xs: "1.5rem", sm: "1.7rem" }, // หัวข้อใหญ่ชัดเจน
            color: "#1A1A1A",
            lineHeight: 1.2
          }}
        >
          {targetItem ? "ลบรายการอาหาร?" : "ยกเลิกออเดอร์?"}
        </DialogTitle>
      </Box>

      <DialogContent sx={{ pb: 1, mt: 2 }}>
        <DialogContentText
          sx={{
            textAlign: "center",
            mb: 3,
            color: "text.primary", // เปลี่ยนเป็นสีที่เข้มขึ้นเพื่อให้อ่านง่าย
            fontSize: { xs: "1rem", sm: "1.1rem" },
            lineHeight: 1.5
          }}
        >
          {targetItem ? (
            <>
              ยืนยันที่จะลบรายการ <br />
              <Typography component="span" variant="inherit" fontWeight={900} color="error.main">
                "{targetItem.name}"
              </Typography>
              <br /> ออกจากออเดอร์ใช่หรือไม่?
            </>
          ) : (
            "รายการอาหารทั้งหมดจะถูกยกเลิก และระบบจะคืนสิทธิ์โปรโมชั่นให้คุณโดยอัตโนมัติ"
          )}
        </DialogContentText>

        <TextField
          autoFocus
          margin="dense"
          label="เหตุผลในการยกเลิก (ระบุหรือไม่ก็ได้)"
          placeholder={
            targetItem
              ? "เช่น สั่งผิด, ต้องการเปลี่ยนเมนู"
              : "เช่น รอนานเกินไป, เปลี่ยนใจ"
          }
          fullWidth
          variant="filled"
          // ปรับขนาด Input ให้ใหญ่ขึ้นสำหรับมือถือ
          InputProps={{ sx: { fontSize: "1rem", py: 1 } }}
          InputLabelProps={{ sx: { fontWeight: 600 } }}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isCancelling}
          sx={{
            mt: 1,
            "& .MuiFilledInput-root": {
              borderRadius: "12px 12px 0 0",
              bgcolor: "#F5F5F5",
              "&:before, &:after": { borderBottom: "2px solid" }
            },
          }}
        />
      </DialogContent>

      <DialogActions
        sx={{ 
          px: 3, 
          pb: 4, 
          pt: 1, 
          // ปรับเป็น Column บนมือถือ เพื่อให้ปุ่มมีขนาดกว้างและกดง่าย (Thumb reach)
          flexDirection: { xs: "column-reverse", sm: "row" }, 
          gap: { xs: 1.5, sm: 2 } 
        }}
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
            color: "#757575",
            fontSize: "1rem",
            textTransform: "none",
            py: 1.5 // เพิ่มความหนาปุ่ม
          }}
        >
          ไม่ลบ / กลับไป
        </Button>

        <Button
          onClick={onConfirm}
          fullWidth
          variant="contained"
          color="error"
          disabled={isCancelling}
          sx={{
            borderRadius: 3,
            py: 1.8, // ปุ่มยืนยันต้องหนาและเด่น
            fontWeight: 900,
            boxShadow: "0 6px 16px rgba(211, 47, 47, 0.3)",
            textTransform: "none",
            fontSize: "1.1rem",
          }}
        >
          {isCancelling ? (
            <CircularProgress size={26} color="inherit" />
          ) : (
            "ใช่, ยืนยันยกเลิก"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}