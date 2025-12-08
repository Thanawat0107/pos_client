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
import type { MenuItemOption } from "../../../../@types/dto/MenuItemOption";

type Props = {
  row: MenuItemOption;
  index?: number;
  onEdit: (row: MenuItemOption) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, next: boolean) => void;
};

export default function ManageMenuItemOptionItem({
  row,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  return (
    <TableRow hover>
      {/* ลำดับ */}
      <TableCell
        align="center"
        sx={{
          width: "10%",
          fontWeight: 800,
          fontVariantNumeric: "tabular-nums",
          color: "text.primary",
        }}
      >
        {index ??  "-"}
      </TableCell>

      {/* ชื่อกลุ่ม */}
      <TableCell sx={{ width: "25%" }}>
        <Stack spacing={0.25}>
          <Typography fontWeight={700} noWrap>
            {row. name}
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {row.isRequired && (
              <Chip size="small" label="บังคับเลือก" color="error" />
            )}
            {row.isMultiple && (
              <Chip size="small" label="เลือกได้หลายรายการ" color="info" />
            )}
          </Stack>
        </Stack>
      </TableCell>

      {/* จำนวนตัวเลือก */}
      <TableCell align="center" sx={{ width: "15%" }}>
        <Chip
          size="small"
          variant="outlined"
          label={`${row.menuOptionDetails?. length ??  0} รายการ`}
        />
      </TableCell>

      {/* เมนูที่ใช้งาน */}
      <TableCell align="center" sx={{ width: "20%" }}>
        <Typography variant="body2" color="text.secondary" noWrap>
          {row. MenuItemName || "-"}
        </Typography>
      </TableCell>

      {/* สถานะ */}
      <TableCell sx={{ width: "15%" }}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
          <Switch
            size="small"
            checked={row.isUsed}
            onChange={(_, v) => onToggleActive(row.id, v)}
          />
          <Typography variant="body2" color="text.secondary">
            {row.isUsed ? "พร้อมใช้" : "ปิดใช้งาน"}
          </Typography>
        </Stack>
      </TableCell>

      {/* การทำงาน */}
      <TableCell align="center" sx={{ width: "15%" }}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
          <Tooltip title="แก้ไข">
            <IconButton size="small" onClick={() => onEdit(row)}>
              <EditOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="ลบ">
            <IconButton size="small" color="error" onClick={() => onDelete(row.id)}>
              <DeleteOutlineIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}