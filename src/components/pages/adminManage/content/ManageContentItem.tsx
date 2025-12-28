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
  return (
    <TableRow hover>
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
          }}
        />
      </TableCell>

      {/* ข้อมูลหลัก */}
      <TableCell>
        <Stack spacing={0.5}>
          <Typography fontWeight={700} variant="body2">
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
              color="primary"
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
            row.contentType === "Promotion"
              ? "warning"
              : row.contentType === "News"
              ? "info"
              : "default"
          }
        />
      </TableCell>

      {/* ระยะเวลา */}
      <TableCell width={180}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <EventIcon fontSize="small" color="action" />
          <Box>
            <Typography variant="caption" display="block">
              เริ่ม: {formatDate(row.startDate)}
            </Typography>
            <Typography variant="caption" display="block">
              สิ้นสุด: {formatDate(row.endDate)}
            </Typography>
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
          />
          <Typography variant="caption" color="text.secondary">
            {row.isUsed ? "Active" : "Inactive"}
          </Typography>
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
