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
  index?: number; // 👈 ลำดับที่ส่งมาจาก List (แบบเดียวกับหน้า MenuItem)
  onEdit: (row: CategoryRow) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, next: boolean) => void;
};

export default function ManageCategoryItem({
  row,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  return (
    <TableRow hover>
      {/* ลำดับแสดง (ซ้ายสุด) */}
      <TableCell
        align="center"
        sx={{
          width: 80,
          fontWeight: 800,
          fontVariantNumeric: "tabular-nums",
          color: "text.primary",
        }}
      >
        {index ?? row.displayOrder ?? "-"}
      </TableCell>

      {/* ชื่อ / slug */}
      <TableCell sx={{ maxWidth: 360 }}>
        <Stack spacing={0.25}>
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
        <Chip size="small" variant="outlined" label={row.itemsCount ?? 0} />
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
