import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { Content } from "../../../../@types/dto/Content";

// ✅ [แก้ไข] รองรับ undefined (ไม่มีวันที่)
const formatDate = (date?: Date | string) => {
  if (!date) return "ตลอดไป";
  return new Date(date).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
  });
};

// ✅ [แก้ไข] รองรับ undefined -> ถ้าไม่มีวันสิ้นสุด = ไม่หมดอายุ (false)
const isExpired = (endDate?: Date | string) => {
  if (!endDate) return false; 
  return new Date(endDate) < new Date();
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
  // ✅ คำนวณสถานะ (ไม่ Error แล้ว)
  const expired = isExpired(row.endDate);

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        p: 1.5,
        // ✅ พื้นหลังสีแดงจางๆ ถ้าหมดอายุ
        bgcolor: expired ? "#fff4f4" : "background.paper",
        borderColor: expired ? "error.light" : "divider",
      }}
    >
      <Stack direction="row" spacing={1.5}>
        {/* รูปซ้าย */}
        <Avatar
          variant="rounded"
          src={
            row.imageUrl ||
            "https://via.placeholder.com/150x150.png?text=Img"
          }
          sx={{
            width: 80,
            height: 80,
            borderRadius: 2,
            bgcolor: "grey.200",
            // (Optional) ทำให้รูปขาวดำถ้าหมดอายุ
            filter: expired ? "grayscale(100%)" : "none",
          }}
        />

        {/* ข้อมูลขวา */}
        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="start"
          >
            <Typography
              variant="subtitle2"
              fontWeight={800}
              noWrap
              sx={{ maxWidth: "70%" }}
              color={expired ? "text.secondary" : "text.primary"}
            >
              {row.title}
            </Typography>
            <Chip
              label={row.contentType}
              size="small"
              sx={{ height: 20, fontSize: 10 }}
              color={
                expired
                  ? "default"
                  : row.contentType === "Promotion"
                  ? "warning"
                  : "default"
              }
              variant={expired ? "outlined" : "filled"}
            />
          </Stack>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.2,
            }}
          >
            {row.description}
          </Typography>

          {/* ✅ [ปรับปรุง] แสดงวันที่ + สถานะหมดอายุ */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="caption"
              fontWeight={expired ? "bold" : "normal"}
              color={expired ? "error.main" : "primary"}
              fontSize={10}
            >
              {formatDate(row.startDate)} - {formatDate(row.endDate)}
            </Typography>

            {expired && (
              <Box
                component="span"
                sx={{
                  bgcolor: "error.main",
                  color: "white",
                  px: 0.5,
                  borderRadius: 0.5,
                  fontSize: 9,
                  fontWeight: "bold",
                }}
              >
                Expired
              </Box>
            )}
             {/* เพิ่ม Tag ระยะยาว กรณีไม่มีวันสิ้นสุด */}
             {!row.endDate && (
              <Box
                component="span"
                sx={{
                  bgcolor: "success.light",
                  color: "white",
                  px: 0.5,
                  borderRadius: 0.5,
                  fontSize: 9,
                  fontWeight: "bold",
                }}
              >
                Always
              </Box>
            )}
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            pt={0.5}
          >
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Switch
                size="small"
                checked={row.isUsed}
                onChange={(_, v) => onToggleActive(row.id, v)}
                color={expired ? "warning" : "success"}
              />
              <Typography variant="caption">
                {row.isUsed ? "On" : "Off"}
              </Typography>
            </Stack>
            <Box>
              <IconButton size="small" onClick={() => onEdit(row)}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(row.id)}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}