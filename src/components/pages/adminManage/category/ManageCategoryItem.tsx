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
import type { CategoryEntity } from "./FormCategory";

export type CategoryRow = CategoryEntity & {
  itemsCount?: number;
  updatedAt?: string;
};

type Props = {
  row: CategoryRow;
  onEdit: (row: CategoryRow) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, next: boolean) => void;
};

export default function ManageCategoryItem({
  row,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  return (
    <TableRow hover>
      {/* ชื่อ / slug */}
      <TableCell sx={{ maxWidth: 420 }}>
        <Stack spacing={0.3}>
          <Typography fontWeight={700} noWrap>
            {row.name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{ fontVariantNumeric: "tabular-nums" }}
          >
            /{row.slug}
          </Typography>
        </Stack>
      </TableCell>

      {/* จำนวนเมนู */}
      <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
        <Chip size="small" label={row.itemsCount ?? 0} />
      </TableCell>

      {/* ลำดับแสดง */}
      <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
        {row.displayOrder}
      </TableCell>

      {/* สถานะ */}
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Switch
            checked={row.isActive}
            onChange={(_, v) => onToggleActive(row.id!, v)}
          />
          <Typography variant="body2" color="text.secondary">
            {row.isActive ? "พร้อมใช้" : "ปิดใช้งาน"}
          </Typography>
        </Stack>
      </TableCell>

      {/* อัปเดตล่าสุด */}
      <TableCell sx={{ whiteSpace: "nowrap" }}>
        <Typography variant="body2" color="text.secondary">
          {row.updatedAt}
        </Typography>
      </TableCell>

      {/* การทำงาน */}
      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
        <Tooltip title="แก้ไข">
          <IconButton size="small" onClick={() => onEdit(row)}>
            <EditOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="ลบ">
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(row.id!)}
          >
            <DeleteOutlineIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
