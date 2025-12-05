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
import type { MenuItemDto } from "../../../../@types/dto/MenuItem";

function formatCurrencyTHB(n: number) {
  return n.toLocaleString("th-TH", { style: "currency", currency: "THB" });
}

type Props = {
  row: MenuItemDto;
  index?: number;
  onEdit: (row: MenuItemDto) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, next: boolean) => void;
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
          src={row.imageUrl || "https://via.placeholder.com/96x96.png?text=Menu"}
          alt={row.name}
          imgProps={{
            onError: (e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/96x96.png?text=Menu";
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
          <Typography fontWeight={700} noWrap>
            {row.name}
          </Typography>
          {row.description && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {row.description}
            </Typography>
          )}
        </Stack>
      </TableCell>

      {/* ราคา */}
      <TableCell align="right" sx={{ whiteSpace: "nowrap", width: 140 }}>
        <Typography fontWeight={700}>{formatCurrencyTHB(row.basePrice)}</Typography>
      </TableCell>

      {/* หมวดหมู่ */}
      <TableCell sx={{ whiteSpace: "nowrap", width: 160 }}>
        <Chip
          size="small"
          label={row.menuCategoryName ?? "ไม่มีหมวดหมู่"}
          variant="outlined"
        />
      </TableCell>

      {/* สถานะ */}
      <TableCell sx={{ whiteSpace: "nowrap", width: 140 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Switch
            checked={row.isUsed && !row.isDeleted}
            onChange={(_, v) => onToggleActive(row.id, v)}
          />
          <Typography variant="body2" color="text.secondary">
            {row.isUsed && !row.isDeleted ? "พร้อมขาย" : "ปิดขาย"}
          </Typography>
        </Stack>
      </TableCell>

      {/* อัปเดตล่าสุด */}
      <TableCell sx={{ whiteSpace: "nowrap", width: 180 }}>
        <Typography variant="body2" color="text.secondary">
          {new Date(row.updatedAt).toLocaleString("th-TH")}
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