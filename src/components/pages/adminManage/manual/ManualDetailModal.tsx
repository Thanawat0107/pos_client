import {
  Dialog,
  IconButton,
  Typography,
  Box,
  CardMedia,
  Chip,
  Stack,
  Divider,
  Button,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Close as CloseIcon,
  Place as PlaceIcon,
  Phone as PhoneIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import type { Manual } from "../../../../@types/dto/Manual";

interface Props {
  open: boolean;
  onClose: () => void;
  manual: Manual | null;
}

export const ManualDetailModal = ({ open, onClose, manual }: Props) => {
  if (!manual) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm" // กำหนดความกว้างสูงสุดแค่ขนาด sm (ประมาณ 600px)
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "32px", // ขอบมนสวยงามแบบทันสมัย
          overflow: "hidden",
          bgcolor: "#FFF",
        },
      }}
    >
      {/* --- ปุ่มปิดมุมขวาบน --- */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 16,
          top: 16,
          bgcolor: "rgba(255,255,255,0.8)",
          zIndex: 10,
          "&:hover": { bgcolor: "#EEE" },
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: 0 }}>
        {/* --- รูปภาพ (ปรับความสูงให้พอดี ไม่ใหญ่เกินไป) --- */}
        <CardMedia
          component="img"
          height="240"
          image={manual.fileUrl}
          sx={{ objectFit: "cover", bgcolor: "#F3F4F6" }}
        />

        <Box sx={{ p: 4 }}>
          {/* --- หัวข้อและพิกัด --- */}
          <Chip
            label={manual.category}
            size="small"
            sx={{
              bgcolor: "#FEE2E2",
              color: "#D32F2F",
              fontWeight: "800",
              mb: 1,
              fontSize: "14px",
            }}
          />
          <Typography
            variant="h4"
            fontWeight="900"
            sx={{ color: "#111827", mb: 1, lineHeight: 1.2 }}
          >
            {manual.title}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
            <PlaceIcon sx={{ color: "#D32F2F", fontSize: 24 }} />
            <Typography variant="h5" fontWeight="600" color="text.secondary">
              {manual.location || "จุดบริการชุมชน"}
            </Typography>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* --- เนื้อหาขั้นตอนการใช้งาน (เน้นตัวหนังสือใหญ่ อ่านง่าย) --- */}
          <Typography
            variant="h5"
            fontWeight="800"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            📖 วิธีใช้งาน:
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            {manual.content?.split("\n").map((step, index) => (
              <Stack key={index} direction="row" spacing={2}>
                <Typography variant="h5" fontWeight="900" color="#D32F2F">
                  {index + 1}.
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="500"
                  sx={{ color: "#374151", lineHeight: 1.5 }}
                >
                  {step}
                </Typography>
              </Stack>
            ))}
          </Box>
        </Box>
      </DialogContent>

      {/* --- ปุ่มแอคชั่นด้านล่าง --- */}
      <DialogActions sx={{ p: 3, pt: 0, flexDirection: "column", gap: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<PhoneIcon />}
          sx={{
            bgcolor: "#10B981", // สีเขียว Emerald ทันสมัย
            "&:hover": { bgcolor: "#059669" },
            borderRadius: "16px",
            py: 1.5,
            fontSize: "18px",
            fontWeight: "700",
            textTransform: "none",
            boxShadow: "none",
          }}
        >
          ขอความช่วยเหลือ
        </Button>

        <Button
          fullWidth
          variant="contained"
          onClick={onClose}
          startIcon={<CheckIcon />}
          sx={{
            bgcolor: "#111827", // สีเข้มแบบ Minimal
            "&:hover": { bgcolor: "#1F2937" },
            borderRadius: "16px",
            py: 1.5,
            fontSize: "18px",
            fontWeight: "700",
            textTransform: "none",
            boxShadow: "none",
          }}
        >
          เข้าใจแล้วจ้า
        </Button>
      </DialogActions>
    </Dialog>
  );
};
