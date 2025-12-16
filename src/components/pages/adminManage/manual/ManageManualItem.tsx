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
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DescriptionIcon from "@mui/icons-material/Description"; // Icon สำหรับไฟล์ทั่วไป
import type { Manual } from "../../../../@types/dto/Manual";

type Props = {
  row: Manual;
  index?: number;
  onEdit: (row: Manual) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, next: boolean) => void;
};

export default function ManageManualItem({
  row,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  return (
    <TableRow hover>
      {/* ลำดับ */}
      <TableCell align="center" sx={{ whiteSpace: "nowrap", width: 80 }}>
        <Typography fontWeight={800}>{index ?? "-"}</Typography>
      </TableCell>

      {/* รูป หรือ ไอคอนไฟล์ */}
      <TableCell width={100}>
        {row.fileUrl ? (
          <Avatar
            variant="rounded"
            src={row.fileUrl}
            alt="Manual File"
            sx={{
              width: 80,
              height: 80,
              borderRadius: 2,
              bgcolor: "primary.light",
              color: "primary.main",
            }}
          >
             {/* Fallback ถ้าโหลดรูปไม่ได้ หรือเป็นไฟล์อื่น ให้โชว์ไอคอน */}
            <DescriptionIcon />
          </Avatar>
        ) : (
          <Avatar
            variant="rounded"
            sx={{ width: 80, height: 80, borderRadius: 2 }}
          >
            <DescriptionIcon />
          </Avatar>
        )}
      </TableCell>

      {/* เนื้อหา / หมวดหมู่ */}
      <TableCell sx={{ maxWidth: 360 }}>
        <Stack spacing={0.3}>
          <Typography fontWeight={700} noWrap>
            {row.category}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {row.content}
          </Typography>
        </Stack>
      </TableCell>

      {/* Target Role */}
      <TableCell sx={{ whiteSpace: "nowrap", width: 140 }}>
        <Chip
          size="small"
          label={row.targetRole}
          color={row.targetRole === "Admin" ? "error" : "default"}
          variant="outlined"
        />
      </TableCell>

      {/* สถานะ */}
      <TableCell sx={{ whiteSpace: "nowrap", width: 140 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Switch
            checked={row.isUsed}
            onChange={(_, v) => onToggleActive(row.id, v)}
          />
          <Typography variant="body2" color="text.secondary">
            {row.isUsed ? "ใช้งาน" : "ปิด"}
          </Typography>
        </Stack>
      </TableCell>

      {/* อัปเดตล่าสุด */}
      <TableCell sx={{ whiteSpace: "nowrap", width: 180 }}>
        <Typography variant="body2" color="text.secondary">
          {new Date(row.updateAt).toLocaleString("th-TH")}
        </Typography>
      </TableCell>

      {/* การทำงาน */}
      <TableCell align="right" sx={{ whiteSpace: "nowrap", width: 120 }}>
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