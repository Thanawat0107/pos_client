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
    <TableRow hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>

      {/* 1. ลำดับ */}
      <TableCell align="center" sx={{ whiteSpace: "nowrap", width: 80, py: 2.5, pl: 4 }}>
        <Typography sx={{ fontSize: "1rem", fontWeight: 800 }} color="text.secondary">
          {index ?? "-"}
        </Typography>
      </TableCell>

      {/* 2. ชื่อกลุ่ม + Chips */}
      <TableCell sx={{ minWidth: 220, py: 2.5 }}>
        <Stack spacing={1}>
          <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.3 }}>
            {row.name}
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {row.isRequired && (
              <Chip
                size="small"
                label="บังคับ"
                color="error"
                variant="outlined"
                sx={{ borderRadius: 1.5, fontWeight: 600, fontSize: "0.8rem", height: 24 }}
              />
            )}
            <Chip
              size="small"
              label={row.isMultiple ? "หลายรายการ" : "รายการเดียว"}
              color={row.isMultiple ? "info" : "default"}
              variant="outlined"
              sx={{ borderRadius: 1.5, fontWeight: 600, fontSize: "0.8rem", height: 24 }}
            />
          </Stack>
        </Stack>
      </TableCell>

      {/* 3. รูปแบบ */}
      <TableCell align="center" sx={{ whiteSpace: "nowrap", py: 2.5 }}>
        <Typography sx={{ fontSize: "1rem" }} color="text.secondary">
          {row.isMultiple ? "Checkbox" : "Radio"}
        </Typography>
      </TableCell>

      {/* 4. บังคับเลือก */}
      <TableCell align="center" sx={{ whiteSpace: "nowrap", py: 2.5 }}>
        <Chip
          size="small"
          label={row.isRequired ? "บังคับ" : "ไม่บังคับ"}
          variant="outlined"
          color={row.isRequired ? "warning" : "default"}
          sx={{ borderRadius: 1.5, fontWeight: 600, fontSize: "0.9rem", height: 30, px: 0.5 }}
        />
      </TableCell>

      {/* 5. ตัวเลือกย่อย */}
      <TableCell align="center" sx={{ whiteSpace: "nowrap", py: 2.5 }}>
        <Typography sx={{ fontSize: "1rem", fontWeight: 600 }}>
          {row.menuOptionDetails?.length ?? 0}{" "}
          <Typography component="span" sx={{ fontSize: "0.9rem" }} color="text.secondary">
            รายการ
          </Typography>
        </Typography>
      </TableCell>

      {/* 6. สถานะ */}
      <TableCell align="center" sx={{ whiteSpace: "nowrap", width: 160, py: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
          <Switch
            checked={row.isUsed}
            onChange={(_, v) => onToggleActive(row.id, v)}
            color="success"
          />
          <Typography
            sx={{ fontSize: "1rem", fontWeight: 600 }}
            color={row.isUsed ? "success.main" : "text.disabled"}
          >
            {row.isUsed ? "เปิด" : "ปิด"}
          </Typography>
        </Stack>
      </TableCell>

      {/* 7. การจัดการ */}
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
          <Tooltip title="ลบถาวร">
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