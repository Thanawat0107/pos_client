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
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EventIcon from "@mui/icons-material/Event";
import type { Content } from "../../../../@types/dto/Content";

// ✅ [แก้ไข 1] Helper จัดรูปแบบวันที่: รองรับ undefined
const formatDate = (date?: Date | string) => {
  if (!date) return "ตลอดไป";
  return new Date(date).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

// ✅ [แก้ไข 2] Helper เช็คหมดอายุ: รองรับ undefined
const isExpired = (endDate?: Date | string) => {
  if (!endDate) return false; // ถ้าไม่มีวันสิ้นสุด = ไม่หมดอายุ
  return new Date(endDate) < new Date();
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
  // ✅ คำนวณสถานะหมดอายุ (จะไม่ error แล้วเพราะแก้ helper แล้ว)
  const expired = isExpired(row.endDate);

  return (
    <TableRow
      hover
      sx={{
        bgcolor: expired ? "#fff4f4" : "inherit", // สีแดงจางๆ ถ้าหมดอายุ
      }}
    >
      {/* ลำดับ */}
      <TableCell align="center" sx={{ whiteSpace: "nowrap", width: 60 }}>
        <Typography fontWeight={800}>{index ?? "-"}</Typography>
      </TableCell>

      {/* รูปภาพ */}
      <TableCell width={120}>
        <Avatar
          variant="rounded"
          src={
            row.imageUrl ||
            "https://via.placeholder.com/150x80.png?text=No+Image"
          }
          alt={row.title}
          sx={{
            width: 100,
            height: 60,
            borderRadius: 2,
            bgcolor: "grey.100",
            filter: expired ? "grayscale(100%)" : "none",
          }}
        />
      </TableCell>

      {/* ข้อมูลหลัก */}
      <TableCell>
        <Stack spacing={0.5}>
          <Typography
            fontWeight={700}
            variant="body2"
            color={expired ? "text.secondary" : "text.primary"}
          >
            {row.title}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ maxWidth: 300 }}
          >
            {row.description}
          </Typography>
          {row.contentType === "Promotion" && row.promoCode && (
            <Chip
              label={`Code: ${row.promoCode}`}
              size="small"
              color={expired ? "default" : "primary"}
              variant="outlined"
              sx={{ width: "fit-content", height: 20, fontSize: 10 }}
            />
          )}
        </Stack>
      </TableCell>

      {/* ประเภท */}
      <TableCell width={120}>
        <Chip
          label={row.contentType}
          size="small"
          color={
            expired
              ? "default"
              : row.contentType === "Promotion"
              ? "warning"
              : "info"
          }
          variant={expired ? "outlined" : "filled"}
        />
      </TableCell>

      {/* ระยะเวลา */}
      <TableCell width={180}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <EventIcon fontSize="small" color={expired ? "error" : "action"} />
          <Box>
            <Typography variant="caption" display="block">
              เริ่ม: {formatDate(row.startDate)}
            </Typography>

            {/* ส่วนวันสิ้นสุด */}
            <Typography
              variant="caption"
              display="block"
              fontWeight={expired ? "bold" : "normal"}
              color={expired ? "error.main" : "text.primary"}
            >
              สิ้นสุด: {formatDate(row.endDate)} 
            </Typography>

            {/* Badge บอกว่า หมดอายุ */}
            {expired && (
              <Chip
                label="หมดอายุ"
                color="error"
                size="small"
                sx={{ mt: 0.5, height: 18, fontSize: 10 }}
              />
            )}
             {/* Badge บอกว่า ตลอดไป (Optional: อยากใส่เพิ่มก็ได้) */}
             {!row.endDate && (
              <Chip
                label="ระยะยาว"
                color="success"
                size="small"
                variant="outlined"
                sx={{ mt: 0.5, height: 18, fontSize: 10 }}
              />
            )}
          </Box>
        </Stack>
      </TableCell>

      {/* สถานะ */}
      <TableCell sx={{ whiteSpace: "nowrap", width: 120 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Switch
            checked={row.isUsed}
            onChange={(_, v) => onToggleActive(row.id, v)}
            size="small"
            color={expired ? "warning" : "success"}
          />
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {row.isUsed ? "เปิดใช้งาน" : "ปิด"}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      {/* การทำงาน */}
      <TableCell align="right" sx={{ whiteSpace: "nowrap", width: 100 }}>
        <Tooltip title="แก้ไข">
          <IconButton onClick={() => onEdit(row)} size="small">
            <EditOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="ลบ">
          <IconButton
            onClick={() => onDelete(row.id)}
            size="small"
            color="error"
          >
            <DeleteOutlineIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}