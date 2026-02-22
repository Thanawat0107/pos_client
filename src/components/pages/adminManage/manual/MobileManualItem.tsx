 import {
  Chip,
  IconButton,
  Paper,
  Stack,
  Switch,
  Typography,
  Divider,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PlaceIcon from "@mui/icons-material/Place";
import type { Manual } from "../../../../@types/dto/Manual";

type Props = {
  row: Manual;
  index?: number;
  onEdit: (row: Manual) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, next: boolean) => void;
};

export default function MobileManualItem({
  row,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        p: 2,
        bgcolor: "background.paper",
        borderColor: row.isUsed ? "divider" : "action.disabledBackground",
        transition: "0.2s",
      }}
    >
      <Stack spacing={1.5}>
        {/* ส่วนที่ 1: หัวข้อ + สถานะ */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2 }} noWrap>
              {row.title || "ไม่มีชื่อหัวข้อ"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {row.id}{index !== undefined ? ` • ลำดับที่ ${index}` : ""}
            </Typography>
          </Stack>

          <Chip
            size="small"
            label={row.isUsed ? "เปิดใช้งาน" : "ปิดใช้งาน"}
            color={row.isUsed ? "success" : "default"}
            variant={row.isUsed ? "filled" : "outlined"}
            sx={{ fontWeight: 700, height: 24, flexShrink: 0 }}
          />
        </Stack>

        {/* ส่วนที่ 2: Location */}
        {row.location && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <PlaceIcon sx={{ fontSize: 13, color: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary">
              {row.location}
            </Typography>
          </Stack>
        )}

        {/* ส่วนที่ 3: Chips แสดงคุณสมบัติ */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            label={row.targetRole}
            size="small"
            color={row.targetRole === "Admin" ? "error" : row.targetRole === "Customer" ? "primary" : "default"}
            variant="filled"
            sx={{ fontSize: "0.7rem", fontWeight: 700 }}
          />
          <Chip
            label={row.category}
            size="small"
            variant="outlined"
            sx={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}
          />
        </Stack>

        <Divider sx={{ borderStyle: "dashed" }} />

        {/* ส่วนที่ 4: Toggle & Actions */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Switch
              size="small"
              checked={row.isUsed}
              onChange={(_, v) => onToggleActive(row.id, v)}
              color="success"
            />
            <Typography
              variant="body2"
              fontWeight={600}
              color={row.isUsed ? "success.main" : "text.disabled"}
            >
              {row.isUsed ? "พร้อมใช้งาน" : "ปิดชั่วคราว"}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton
              size="medium"
              onClick={() => onEdit(row)}
              sx={{ bgcolor: "primary.50", color: "primary.main", "&:hover": { bgcolor: "primary.100" } }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>

            <IconButton
              size="medium"
              color="error"
              onClick={() => onDelete(row.id)}
              sx={{ bgcolor: "error.50", color: "error.main", "&:hover": { bgcolor: "error.100" } }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}