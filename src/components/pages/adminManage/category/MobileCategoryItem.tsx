import {
  Paper,
  Stack,
  Typography,
  Chip,
  Switch,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { MenuCategory } from "../../../../@types/dto/MenuCategory";

type MobileCategoryItemProps = {
  row: MenuCategory;
  index: number;
  onEdit: (row: MenuCategory) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, value: boolean) => void;
};

export default function MobileCategoryItem({
  row,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}: MobileCategoryItemProps) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.5 }}>
      <Stack spacing={1}>
        {/* ชื่อ + สถานะ */}
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={1}
        >
          <Stack spacing={0.25} minWidth={0}>
            <Typography variant="subtitle1" fontWeight={800} noWrap>
              {row.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              /{row.slug}
            </Typography>
          </Stack>

          <Chip
            size="small"
            label={row.isUsed ? "พร้อมใช้" : "ปิดใช้งาน"}
            color={row.isUsed ? "success" : "default"}
            sx={{
              height: 24,
              ml: 1,
              "& .MuiChip-label": { px: 0.75, fontSize: 12 },
            }}
          />
        </Stack>

        {/* ลำดับการแสดง + เมนู + (ลำดับจากฐานข้อมูลถ้ามี) */}
        <Stack
          direction="row"
          alignItems="center"
          flexWrap="wrap"
          sx={{ rowGap: 0.5, columnGap: 0.75 }}
        >
          {/* ✅ ลำดับการแสดงตามหน้า */}
          <Chip size="small" variant="outlined" label={`ลำดับแสดง ${index}`} />

          <Chip size="small" label={`เมนู ${0} รายการ`} />
        </Stack>

        {/* สวิตช์ + ปุ่ม + เวลาอัปเดต */}
        <Stack spacing={0.5}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Switch
                size="small"
                checked={row.isUsed}
                onChange={(_, v) => onToggleActive(row.id, v)}
              />
              <Typography variant="body2" color="text.secondary">
                {row.isUsed ? "เปิดใช้งานอยู่" : "ปิดการใช้งาน"}
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Tooltip title="แก้ไข">
                <IconButton size="small" onClick={() => onEdit(row)}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="ลบ">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete(row.id)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}
