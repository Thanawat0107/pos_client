import {
  Dialog,
  IconButton,
  Typography,
  Box,
  Chip,
  Stack,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Close as CloseIcon,
  Place as PlaceIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import type { Manual } from "../../../../@types/dto/Manual";
import { baseUrl } from "../../../../helpers/SD";

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  water:     { bg: "#E3F2FD", text: "#1565C0" },
  equipment: { bg: "#FFF3E0", text: "#E65100" },
  toilet:    { bg: "#F3E5F5", text: "#6A1B9A" },
};

interface Props {
  open: boolean;
  onClose: () => void;
  manual: Manual | null;
}

export const ManualDetailModal = ({ open, onClose, manual }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!manual) return null;

  const catColor =
    CATEGORY_COLORS[manual.category] ?? { bg: "#F3F4F6", text: "#374151" };
  const steps = manual.content?.split("\n").filter((s) => s.trim()) ?? [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : "28px",
          overflow: "hidden",
          bgcolor: "#FAFAFA",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* ----- รูปภาพ + ปุ่มปิด ----- */}
      <Box sx={{ position: "relative", flexShrink: 0 }}>
        <Box
          component="img"
          src={baseUrl + manual.fileUrl}
          sx={{
            width: "100%",
            height: isMobile ? 220 : 260,
            objectFit: "cover",
            display: "block",
            bgcolor: "#E5E7EB",
          }}
        />
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: "absolute",
            top: 14,
            right: 14,
            bgcolor: "rgba(0,0,0,0.45)",
            color: "#fff",
            "&:hover": { bgcolor: "rgba(0,0,0,0.65)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* ----- เนื้อหา ----- */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 3,
          pt: 3,
          pb: 1,
        }}
      >
        {/* Chip หมวดหมู่ */}
        <Chip
          label={manual.category}
          sx={{
            bgcolor: catColor.bg,
            color: catColor.text,
            fontWeight: 800,
            fontSize: "15px",
            height: 30,
            mb: 1.5,
          }}
        />

        {/* ชื่อ — ใหญ่มาก */}
        <Typography
          sx={{ fontSize: "30px", fontWeight: 900, color: "#111827", lineHeight: 1.15, mb: 1.5 }}
        >
          {manual.title}
        </Typography>

        {/* ตำแหน่งบริการ */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
          <Box
            sx={{
              bgcolor: "#FEE2E2",
              borderRadius: "12px",
              px: 1.5,
              py: 0.75,
              display: "flex",
              alignItems: "center",
              gap: 0.75,
            }}
          >
            <PlaceIcon sx={{ fontSize: 22, color: "#DC2626" }} />
            <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#DC2626" }}>
              {manual.location || "จุดบริการ"}
            </Typography>
          </Box>
        </Stack>

        {/* หัวข้อขั้นตอน */}
        {steps.length > 0 && (
          <>
            <Typography
              sx={{
                fontSize: "18px",
                fontWeight: 800,
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                mb: 2,
              }}
            >
              วิธีใช้งาน
            </Typography>

            <Stack spacing={2.5} sx={{ mb: 3 }}>
              {steps.map((step, index) => (
                <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
                  {/* หมายเลขขั้นตอน — วงกลมใหญ่ */}
                  <Box
                    sx={{
                      minWidth: 44,
                      height: 44,
                      borderRadius: "50%",
                      bgcolor: catColor.text,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Typography sx={{ fontSize: "20px", fontWeight: 900, color: "#fff" }}>
                      {index + 1}
                    </Typography>
                  </Box>

                  {/* ข้อความขั้นตอน — ใหญ่ อ่านง่าย */}
                  <Box
                    sx={{
                      bgcolor: "white",
                      borderRadius: "16px",
                      px: 2.5,
                      py: 1.75,
                      flex: 1,
                      border: "1.5px solid #F3F4F6",
                    }}
                  >
                    <Typography
                      sx={{ fontSize: "20px", fontWeight: 600, color: "#1F2937", lineHeight: 1.4 }}
                    >
                      {step}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </>
        )}
      </Box>

      {/* ----- ปุ่มด้านล่าง ----- */}
      <Box sx={{ px: 3, pb: 3, pt: 2, flexShrink: 0 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={onClose}
          startIcon={<CheckIcon sx={{ fontSize: 26 }} />}
          sx={{
            bgcolor: "#111827",
            "&:hover": { bgcolor: "#1F2937" },
            borderRadius: "18px",
            py: 2,
            fontSize: "20px",
            fontWeight: 800,
            textTransform: "none",
            boxShadow: "none",
          }}
        >
          เข้าใจแล้ว
        </Button>
      </Box>
    </Dialog>
  );
};
