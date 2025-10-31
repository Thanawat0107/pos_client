import {
  Paper,
  Stack,
  Typography,
  Chip,
  Switch,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { CategoryRow } from "./ManageCategoryItem";

type Props = {
  row: CategoryRow;
  onEdit: (row: CategoryRow) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, next: boolean) => void;
};

export default function MobileCategoryItem({ row, onEdit, onDelete, onToggleActive }: Props) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.5 }}>
      <Stack spacing={0.5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1" fontWeight={800} noWrap>{row.name}</Typography>
          <Chip
            size="small"
            label={row.isActive ? "พร้อมใช้" : "ปิดใช้งาน"}
            color={row.isActive ? "success" : "default"}
            sx={{ height: 22, "& .MuiChip-label": { px: 0.75, fontSize: 12 } }}
          />
        </Stack>

        <Typography variant="body2" color="text.secondary">/{row.slug}</Typography>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip size="small" label={`เมนู ${row.itemsCount ?? 0} รายการ`} />
          <Chip size="small" variant="outlined" label={`ลำดับ ${row.displayOrder}`} />
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">{row.updatedAt}</Typography>
          <Stack direction="row" spacing={0.25} alignItems="center">
            <Switch size="small" checked={row.isActive} onChange={(_, v) => onToggleActive(row.id!, v)} />
            <Tooltip title="แก้ไข"><IconButton size="small" onClick={() => onEdit(row)}><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip>
            <Tooltip title="ลบ"><IconButton size="small" color="error" onClick={() => onDelete(row.id!)}><DeleteOutlineIcon fontSize="small" /></IconButton></Tooltip>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}