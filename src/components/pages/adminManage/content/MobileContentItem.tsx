import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Switch,
  Typography,
  LinearProgress,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber"; // ไอคอนตั๋ว/โปรโมชั่น
import type { Content } from "../../../../@types/dto/Content";

// ✅ Helper จัดรูปแบบวันที่
const formatDate = (date?: Date | string | null) => {
  if (!date) return "ตลอดไป";
  return new Date(date).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
  });
};

// ✅ Helper เช็คหมดอายุ
const isExpired = (endDate?: Date | string | null) => {
  if (!endDate) return false;
  return new Date(endDate) < new Date();
};

// ✅ Helper คำนวณเปอร์เซ็นต์
const getUsagePercent = (current: number, max?: number) => {
  if (!max || max === 0) return 0;
  return Math.min((current / max) * 100, 100);
};

type Props = {
  row: Content;
  onEdit: (row: Content) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, next: boolean) => void;
};

export default function MobileContentItem({
  row,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  const expired = isExpired(row.endDate);
  const isSoldOut = row.maxUsageCount ? row.currentUsageCount >= row.maxUsageCount : false;
  const usagePercent = getUsagePercent(row.currentUsageCount, row.maxUsageCount);

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        p: 1.5,
        bgcolor: expired || isSoldOut ? "#fff8f8" : "background.paper",
        borderColor: expired || isSoldOut ? "error.light" : "divider",
        transition: "all 0.3s ease",
      }}
    >
      <Stack direction="row" spacing={1.5}>
        {/* --- รูปซ้าย --- */}
        <Box sx={{ position: "relative" }}>
          <Avatar
            variant="rounded"
            src={row.imageUrl || "https://via.placeholder.com/150x150.png?text=Img"}
            sx={{
              width: 85,
              height: 85,
              borderRadius: 2,
              bgcolor: "grey.200",
              filter: expired || isSoldOut ? "grayscale(100%)" : "none",
              border: "1px solid #eee",
            }}
          />
          {isSoldOut && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                bgcolor: "rgba(0,0,0,0.4)",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="caption" color="white" fontWeight="bold" sx={{ fontSize: 10 }}>
                เต็มแล้ว
              </Typography>
            </Box>
          )}
        </Box>

        {/* --- ข้อมูลขวา --- */}
        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="start">
            <Typography
              variant="subtitle2"
              fontWeight={800}
              noWrap
              sx={{ flex: 1, mr: 1 }}
              color={expired || isSoldOut ? "text.secondary" : "text.primary"}
            >
              {row.title}
            </Typography>
            <Chip
              label={row.contentType}
              size="small"
              sx={{ height: 18, fontSize: 9 }}
              color={
                expired || isSoldOut
                  ? "default"
                  : row.contentType === "Promotion"
                  ? "warning"
                  : "info"
              }
              variant={expired || isSoldOut ? "outlined" : "filled"}
            />
          </Stack>

          {/* ⭐ ส่วนแสดง Promo Code (ถ้ามี) */}
          {row.contentType === "Promotion" && row.promoCode && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <ConfirmationNumberIcon sx={{ fontSize: 12, color: "primary.main" }} />
              <Typography variant="caption" fontWeight="bold" color="primary">
                {row.promoCode}
              </Typography>
            </Stack>
          )}

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              fontSize: 11,
            }}
          >
            {row.description || "ไม่มีคำอธิบาย"}
          </Typography>

          {/* ⭐ แสดง Usage Progress (Mobile Version) */}
          {row.contentType === "Promotion" && (
            <Box sx={{ mt: 0.5 }}>
              <Stack direction="row" justifyContent="space-between" mb={0.2}>
                <Typography variant="caption" sx={{ fontSize: 9 }} color="text.secondary">
                  สิทธิ์ที่ใช้: {row.currentUsageCount}/{row.maxUsageCount || "∞"}
                </Typography>
                {row.maxUsageCount && (
                   <Typography variant="caption" sx={{ fontSize: 9 }} fontWeight="bold">
                    {Math.round(usagePercent)}%
                  </Typography>
                )}
              </Stack>
              {row.maxUsageCount ? (
                <LinearProgress
                  variant="determinate"
                  value={usagePercent}
                  sx={{ height: 4, borderRadius: 2 }}
                  color={isSoldOut ? "error" : "primary"}
                />
              ) : (
                <Box sx={{ height: 4, bgcolor: "success.lighter", borderRadius: 2 }} />
              )}
            </Box>
          )}

          {/* วันที่ + สถานะ */}
          <Stack direction="row" spacing={1} alignItems="center" pt={0.5}>
            <Typography
              variant="caption"
              fontWeight={expired ? "bold" : "normal"}
              color={expired ? "error.main" : "text.secondary"}
              fontSize={10}
            >
              {formatDate(row.startDate)} - {formatDate(row.endDate)}
            </Typography>

            {expired && (
              <Box component="span" sx={{ bgcolor: "error.main", color: "white", px: 0.5, borderRadius: 0.5, fontSize: 9, fontWeight: "bold" }}>
                EXPIRED
              </Box>
            )}
            {!row.endDate && !expired && (
              <Box component="span" sx={{ bgcolor: "success.main", color: "white", px: 0.5, borderRadius: 0.5, fontSize: 9, fontWeight: "bold" }}>
                ALWAYS
              </Box>
            )}
          </Stack>

          {/* ปุ่มควบคุมด้านล่าง */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" pt={0.5}>
            <Stack direction="row" alignItems="center" spacing={0}>
              <Switch
                size="small"
                checked={row.isUsed}
                onChange={(_, v) => onToggleActive(row.id, v)}
                color="success"
                disabled={expired || isSoldOut}
              />
              <Typography variant="caption" sx={{ fontSize: 10 }}>
                {row.isUsed ? "Active" : "Off"}
              </Typography>
            </Stack>
            <Box>
              <IconButton size="small" onClick={() => onEdit(row)} color="primary">
                <EditOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => onDelete(row.id)}>
                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}