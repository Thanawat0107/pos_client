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
import type { MenuItemEntity } from "./FormMenu";

export type Row = MenuItemEntity & {
  categoryName?: string;
  updatedAt?: string;
};

function formatCurrencyTHB(n: number) {
  return n.toLocaleString("th-TH", { style: "currency", currency: "THB" });
}

type Props = {
  row: Row;
  onEdit: (row: Row) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, next: boolean) => void;
};

export default function ManageMenuItem({
  row,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  return (
    <TableRow hover>
      <TableCell>
        <Avatar
          variant="rounded"
          src={row.image}
          alt={row.name}
          sx={{ width: 48, height: 48, borderRadius: 1, bgcolor: "grey.100" }}
        />
      </TableCell>

      <TableCell>
        <Stack spacing={0.3}>
          <Typography fontWeight={700}>{row.name}</Typography>
          {row.description && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {row.description}
            </Typography>
          )}
        </Stack>
      </TableCell>

      <TableCell align="right">
        <Typography fontWeight={700}>{formatCurrencyTHB(row.price)}</Typography>
      </TableCell>

      <TableCell>
        <Chip
          size="small"
          label={row.categoryName ?? row.categoryId}
          variant="outlined"
        />
      </TableCell>

      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Switch
            checked={row.isActive}
            onChange={(_, v) => onToggleActive(row.id!, v)}
          />
          <Typography variant="body2" color="text.secondary">
            {row.isActive ? "พร้อมขาย" : "ปิดขาย"}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {row.updatedAt}
        </Typography>
      </TableCell>

      <TableCell align="right">
        <Tooltip title="แก้ไข">
          <IconButton onClick={() => onEdit(row)} size="small">
            <EditOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="ลบ">
          <IconButton
            onClick={() => onDelete(row.id!)}
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
