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

// Helper จัดรูปแบบวันที่
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

// ✅ [เพิ่ม] Helper เช็คหมดอายุ
const isExpired = (endDate: Date | string) => {
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
  // ✅ คำนวณสถานะหมดอายุ
  const expired = isExpired(row.endDate);

  return (
    // ✅ [ปรับปรุง] เปลี่ยนสีพื้นหลังถ้าหมดอายุ
    <TableRow 
      hover 
      sx={{ 
        bgcolor: expired ? "#fff4f4" : "inherit" // สีแดงจางๆ
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
            filter: expired ? "grayscale(100%)" : "none", // (Optional) ทำให้รูปเป็นขาวดำถ้าหมดอายุ
          }}
        />
      </TableCell>

      {/* ข้อมูลหลัก */}
      <TableCell>
        <Stack spacing={0.5}>
          <Typography fontWeight={700} variant="body2" color={expired ? "text.secondary" : "text.primary"}>
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
              color={expired ? "default" : "primary"} // ถ้าหมดอายุให้สีเทา
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
          // ถ้าหมดอายุ ปรับสีให้ดูจางลง หรือใช้สี default
          color={
            expired 
              ? "default"
              : row.contentType === "Promotion" ? "warning" : "info"
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
            
            {/* ✅ [ปรับปรุง] ไฮไลท์วันสิ้นสุด */}
            <Typography 
                variant="caption" 
                display="block" 
                fontWeight={expired ? "bold" : "normal"}
                color={expired ? "error.main" : "text.primary"}
            >
              สิ้นสุด: {formatDate(row.endDate)}
            </Typography>

            {/* ✅ [เพิ่ม] Badge บอกว่า Expired */}
            {expired && (
                <Chip 
                    label="หมดอายุ" 
                    color="error" 
                    size="small" 
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
            color={expired ? "warning" : "success"} // เปลี่ยนสี Switch เตือนใจ
          />
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
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