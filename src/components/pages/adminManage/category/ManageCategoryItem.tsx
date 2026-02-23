import {
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
import type { MenuCategory } from "../../../../@types/dto/MenuCategory";

type Props = {
  row: MenuCategory;
  index?: number;
  onEdit: (row: MenuCategory) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, next: boolean) => void;
};

export default function ManageCategoryItem({
  row,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  const isActive = row.isUsed && !row.isDeleted;

  return (
    <TableRow hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>

      {/* 1. ลำดับ */}
      <TableCell align="center" sx={{ whiteSpace: "nowrap", width: 80, py: 2.5, pl: 4 }}>
        <Typography sx={{ fontSize: "1rem", fontWeight: 800 }} color="text.secondary">
          {index ?? "-"}
        </Typography>
      </TableCell>

      {/* 2. ชื่อหมวดหมู่ */}
      <TableCell sx={{ py: 2.5 }}>
        <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.3 }}>
          {row.name}
        </Typography>
      </TableCell>

      {/* 3. สถานะ */}
      <TableCell align="center" sx={{ whiteSpace: "nowrap", width: 200, py: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
          <Switch
            checked={isActive}
            onChange={(_, v) => onToggleActive(row.id, v)}
            color="success"
          />
          <Chip
            label={isActive ? "พร้อมใช้" : "ปิดใช้งาน"}
            sx={
              isActive
                ? {
                    bgcolor: "#F0FDF4",
                    color: "#15803D",
                    border: "1.5px solid #BBF7D0",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    height: 30,
                  }
                : {
                    bgcolor: "#F9FAFB",
                    color: "#6B7280",
                    border: "1.5px solid #E5E7EB",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    height: 30,
                  }
            }
          />
        </Stack>
      </TableCell>

      {/* 4. การจัดการ */}
      <TableCell align="right" sx={{ whiteSpace: "nowrap", width: 120, py: 2.5, pr: 4 }}>
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Tooltip title="แก้ไขข้อมูล">
            <IconButton
              onClick={() => onEdit(row)}
              sx={{
                p: 1,
                color: "info.main",
                bgcolor: "info.lighter",
                "&:hover": { bgcolor: "info.light" },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: "1.3rem" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="ลบหมวดหมู่">
            <IconButton
              onClick={() => onDelete(row.id)}
              sx={{
                p: 1,
                color: "error.main",
                bgcolor: "error.lighter",
                "&:hover": { bgcolor: "error.light" },
              }}
            >
              <DeleteOutlineIcon sx={{ fontSize: "1.3rem" }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
