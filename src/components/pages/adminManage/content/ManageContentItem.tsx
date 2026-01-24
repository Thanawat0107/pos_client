import {
  Avatar,
  Chip,
  IconButton,
  Stack,
  Switch,
  Tooltip,
  Typography,
  TableRow,
  TableCell,
  Box,
  LinearProgress,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import type { Content } from "../../../../@types/dto/Content";

// ✅ Helper จัดรูปแบบวันที่: รองรับ undefined/null
const formatDate = (date?: Date | string | null) => {
  if (!date) return "ตลอดไป";
  return new Date(date).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

// ✅ Helper เช็คหมดอายุ: รองรับ undefined/null
const isExpired = (endDate?: Date | string | null) => {
  if (!endDate) return false; // ถ้าไม่มีวันสิ้นสุด = ไม่หมดอายุ
  return new Date(endDate) < new Date();
};

// ✅ Helper คำนวณเปอร์เซ็นต์การใช้งาน
const getUsagePercent = (current: number, max?: number) => {
  if (!max || max === 0) return 0;
  return Math.min((current / max) * 100, 100);
};

type Props = {
  row: Content;
  index?: number;
  onEdit: (row: Content) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, next: boolean) => void;
};

export default function ManageContentItem({
  row,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  // 1. คำนวณสถานะต่างๆ
  const expired = isExpired(row.endDate);
  const isSoldOut = row.maxUsageCount ? row.currentUsageCount >= row.maxUsageCount : false;
  const usagePercent = getUsagePercent(row.currentUsageCount, row.maxUsageCount);

  return (
    <TableRow
      hover
      sx={{
        // ถ้าหมดอายุ หรือ สิทธิ์เต็ม ให้แถวเป็นสีแดงอ่อนๆ
        bgcolor: expired || isSoldOut ? "#fff8f8" : "inherit",
        transition: "background-color 0.3s ease", // เพื่อให้เวลา SignalR อัปเดตแล้วสีเปลี่ยนนุ่มนวล
      }}
    >
      {/* --- ลำดับ --- */}
      <TableCell align="center" sx={{ whiteSpace: "nowrap", width: 60 }}>
        <Typography fontWeight={800}>{index ?? "-"}</Typography>
      </TableCell>

      {/* --- รูปภาพ --- */}
      <TableCell width={120}>
        <Avatar
          variant="rounded"
          src={row.imageUrl || "https://via.placeholder.com/150x80.png?text=No+Image"}
          alt={row.title}
          sx={{
            width: 100,
            height: 60,
            borderRadius: 2,
            bgcolor: "grey.100",
            filter: expired || isSoldOut ? "grayscale(100%)" : "none",
            border: "1px solid #eee",
          }}
        />
      </TableCell>

      {/* --- ข้อมูลหลักและรหัส --- */}
      <TableCell>
        <Stack spacing={0.5}>
          <Typography
            fontWeight={700}
            variant="body2"
            color={expired || isSoldOut ? "text.secondary" : "text.primary"}
          >
            {row.title}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ maxWidth: 250 }}
          >
            {row.description || "ไม่มีคำอธิบาย"}
          </Typography>
          {row.contentType === "Promotion" && row.promoCode && (
            <Chip
              label={`Code: ${row.promoCode}`}
              size="small"
              color={expired || isSoldOut ? "default" : "primary"}
              variant="outlined"
              sx={{ width: "fit-content", height: 20, fontSize: 10, fontWeight: "bold" }}
            />
          )}
        </Stack>
      </TableCell>

      {/* --- ⭐ การติดตามการใช้งาน (Real-time) --- */}
      <TableCell width={180}>
        {row.contentType === "Promotion" ? (
          <Stack spacing={0.8}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <GroupIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="caption" fontWeight={700}>
                  {row.currentUsageCount} / {row.maxUsageCount || "∞"}
                </Typography>
              </Stack>
              <Typography variant="caption" color={isSoldOut ? "error.main" : "text.secondary"}>
                {row.maxUsageCount ? `${Math.round(usagePercent)}%` : "สิทธิ์ว่าง"}
              </Typography>
            </Box>
            
            {row.maxUsageCount ? (
              <LinearProgress
                variant="determinate"
                value={usagePercent}
                color={isSoldOut ? "error" : usagePercent > 80 ? "warning" : "primary"}
                sx={{ height: 6, borderRadius: 3, bgcolor: "grey.200" }}
              />
            ) : (
              <Box sx={{ height: 6, bgcolor: "success.lighter", borderRadius: 3 }} />
            )}

            {isSoldOut && (
              <Typography variant="caption" color="error.main" fontWeight="bold" sx={{ fontSize: 9 }}>
                * สิทธิ์การใช้งานเต็มแล้ว
              </Typography>
            )}
          </Stack>
        ) : (
          <Typography variant="caption" color="text.disabled">
            - ไม่ใช่โปรโมชั่น -
          </Typography>
        )}
      </TableCell>

      {/* --- ประเภท --- */}
      <TableCell width={100}>
        <Chip
          label={row.contentType}
          size="small"
          color={
            expired || isSoldOut
              ? "default"
              : row.contentType === "Promotion"
              ? "warning"
              : "info"
          }
          variant={expired || isSoldOut ? "outlined" : "filled"}
        />
      </TableCell>

      {/* --- ระยะเวลา --- */}
      <TableCell width={180}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <EventIcon fontSize="small" color={expired ? "error" : "action"} />
          <Box>
            <Typography variant="caption" display="block" color="text.secondary">
              เริ่ม: {formatDate(row.startDate)}
            </Typography>
            <Typography
              variant="caption"
              display="block"
              fontWeight={expired ? "bold" : "normal"}
              color={expired ? "error.main" : "text.primary"}
            >
              สิ้นสุด: {formatDate(row.endDate)}
            </Typography>

            <Stack direction="row" spacing={0.5} mt={0.5}>
              {expired && <Chip label="หมดอายุ" color="error" size="small" sx={{ height: 18, fontSize: 9 }} />}
              {!row.endDate && !expired && (
                <Chip label="ถาวร" color="success" variant="outlined" size="small" sx={{ height: 18, fontSize: 9 }} />
              )}
            </Stack>
          </Box>
        </Stack>
      </TableCell>

      {/* --- สถานะการเปิด/ปิด --- */}
      <TableCell sx={{ whiteSpace: "nowrap", width: 100 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Switch
            checked={row.isUsed}
            onChange={(_, v) => onToggleActive(row.id, v)}
            size="small"
            color="success"
            disabled={expired || isSoldOut} // ถ้าหมดอายุหรือสิทธิ์เต็ม ไม่ควรให้เปิดใช้งานต่อ
          />
          <Typography variant="caption" color={row.isUsed ? "success.main" : "text.secondary"}>
            {row.isUsed ? "Active" : "Off"}
          </Typography>
        </Stack>
      </TableCell>

      {/* --- การทำงาน (Edit/Delete) --- */}
      <TableCell align="right" sx={{ whiteSpace: "nowrap", width: 100 }}>
        <Tooltip title="แก้ไขข้อมูล">
          <IconButton onClick={() => onEdit(row)} size="small" color="primary">
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="ลบถาวร">
          <IconButton onClick={() => onDelete(row.id)} size="small" color="error">
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}