 import {
  Paper,
  Stack,
  Typography,
  Chip,
  Switch,
  IconButton,
  Divider,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ChecklistIcon from "@mui/icons-material/Checklist";
import type { MenuItemOption } from "../../../../@types/dto/MenuItemOption";

type Props = {
  row: MenuItemOption;
  index: number;
  onEdit: (row: MenuItemOption) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, value: boolean) => void;
};

export default function MobileMenuItemOption({
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
        "&:active": { bgcolor: "action.hover" },
      }}
    >
      <Stack spacing={1.5}>
        {/* ส่วนที่ 1: หัวข้อและลำดับ */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Stack spacing={0.5} sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight={800}
              sx={{ lineHeight: 1.2 }}
            >
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {row.id} • ลำดับที่ {index}
            </Typography>
          </Stack>

          <Chip
            size="small"
            label={row.isUsed ? "เปิดใช้งาน" : "ปิดใช้งาน"}
            color={row.isUsed ? "success" : "default"}
            variant={row.isUsed ? "filled" : "outlined"}
            sx={{ fontWeight: 700, height: 24 }}
          />
        </Stack>

        {/* ส่วนที่ 2: คุณสมบัติ (Badges) */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {row.isRequired && (
            <Chip
              label="บังคับเลือก"
              size="small"
              color="error"
              variant="filled"
              sx={{ fontSize: "0.7rem" }}
            />
          )}
          <Chip
            label={row.isMultiple ? "เลือกได้หลายอย่าง" : "เลือกได้ชิ้นเดียว"}
            size="small"
            color="info"
            variant="filled"
            sx={{ fontSize: "0.7rem" }}
          />
          <Chip
            icon={<ChecklistIcon style={{ fontSize: 14 }} />}
            label={`${row.menuOptionDetails?.length ?? 0} รายการ`}
            size="small"
            variant="outlined"
            sx={{ fontSize: "0.7rem" }}
          />
        </Stack>

        <Divider sx={{ borderStyle: "dashed" }} />

        {/* ส่วนที่ 3: ปุ่มควบคุมและ Actions */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
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
              {row.isUsed ? "พร้อมขาย" : "ปิดชั่วคราว"}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton
              size="medium"
              onClick={() => onEdit(row)}
              sx={{
                bgcolor: "primary.50",
                color: "primary.main",
                "&:hover": { bgcolor: "primary.100" },
              }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>

            <IconButton
              size="medium"
              color="error"
              onClick={() => onDelete(row.id)}
              sx={{
                bgcolor: "error.50",
                color: "error.main",
                "&:hover": { bgcolor: "error.100" },
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}
