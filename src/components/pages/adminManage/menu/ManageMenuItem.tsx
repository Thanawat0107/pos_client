import {
  Avatar, Chip, IconButton, Stack, Switch, Tooltip, Typography, TableRow, TableCell,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { MenuItemEntity } from "./FormMenu";

export type Row = MenuItemEntity & { categoryName?: string; updatedAt?: string };

function formatCurrencyTHB(n: number) {
  return n.toLocaleString("th-TH", { style: "currency", currency: "THB" });
}

type Props = {
  row: Row;
  index?: number;
  onEdit: (row: Row) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, next: boolean) => void;
};

export default function ManageMenuItem({
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

      {/* รูปใหญ่ขึ้น + fallback */}
      <TableCell width={100}>
        <Avatar
          variant="rounded"
          src={row.image || "https://via.placeholder.com/96x96.png?text=Menu"}
          alt={row.name}
          imgProps={{
            onError: (e) => {
              e.currentTarget.src = "https://via.placeholder.com/96x96.png?text=Menu";
            },
          }}
          sx={{
            width: 80,
            height: 80,
            borderRadius: 2,
            bgcolor: "grey.100",
            flexShrink: 0,
          }}
        />
      </TableCell>

      {/* ชื่อ/คำอธิบาย */}
      <TableCell sx={{ maxWidth: 360 }}>
        <Stack spacing={0.3}>
          <Typography fontWeight={700} noWrap>{row.name}</Typography>
          {row.description && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {row.description}
            </Typography>
          )}
        </Stack>
      </TableCell>

      {/* ราคา */}
      <TableCell align="right" sx={{ whiteSpace: "nowrap", width: 140 }}>
        <Typography fontWeight={700}>{formatCurrencyTHB(row.price)}</Typography>
      </TableCell>

      {/* หมวดหมู่ */}
      <TableCell sx={{ whiteSpace: "nowrap", width: 160 }}>
        <Chip size="small" label={row.categoryName ?? row.categoryId} variant="outlined" />
      </TableCell>

      {/* สถานะ */}
      <TableCell sx={{ whiteSpace: "nowrap", width: 140 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Switch checked={row.isActive} onChange={(_, v) => onToggleActive(row.id!, v)} />
          <Typography variant="body2" color="text.secondary">
            {row.isActive ? "พร้อมขาย" : "ปิดขาย"}
          </Typography>
        </Stack>
      </TableCell>

      {/* อัปเดตล่าสุด */}
      <TableCell sx={{ whiteSpace: "nowrap", width: 180 }}>
        <Typography variant="body2" color="text.secondary">{row.updatedAt}</Typography>
      </TableCell>

      {/* การทำงาน */}
      <TableCell align="right" sx={{ whiteSpace: "nowrap", width: 120 }}>
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
