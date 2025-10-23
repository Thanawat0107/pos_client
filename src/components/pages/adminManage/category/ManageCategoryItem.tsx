import {
  Chip, IconButton, Stack, Switch, Tooltip, Typography, TableRow, TableCell,
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

export default function ManageCategoryItem({ row, onEdit, onDelete, onToggleActive }: Props) {
  return (
    <TableRow hover>
      <TableCell>
        <Stack spacing={0.3}>
          <Typography fontWeight={700}>{row.name}</Typography>
          <Typography variant="body2" color="text.secondary">/{row.slug}</Typography>
        </Stack>
      </TableCell>

      <TableCell align="center">
        <Chip size="small" label={row.itemsCount ?? 0} />
      </TableCell>

      <TableCell align="center">{row.displayOrder}</TableCell>

      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Switch checked={row.isActive} onChange={(_, v) => onToggleActive(row.id!, v)} />
          <Typography variant="body2" color="text.secondary">
            {row.isActive ? "พร้อมใช้" : "ปิดใช้งาน"}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell>
        <Typography variant="body2" color="text.secondary">{row.updatedAt}</Typography>
      </TableCell>

      <TableCell align="right">
        <Tooltip title="แก้ไข">
          <IconButton onClick={() => onEdit(row)} size="small"><EditOutlinedIcon /></IconButton>
        </Tooltip>
        <Tooltip title="ลบ">
          <IconButton onClick={() => onDelete(row.id!)} size="small" color="error">
            <DeleteOutlineIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
