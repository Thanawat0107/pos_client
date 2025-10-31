// src/components/menus/MobileMenuItem.tsx
import {
  Avatar, Chip, IconButton, Paper, Stack, Switch, Tooltip, Typography, Box
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { Row } from "./ManageMenuItem";

const moneyTHB = (n: number) => n.toLocaleString("th-TH", { style: "currency", currency: "THB" });

type Props = {
  row: Row;
  orderNo?: number;
  onEdit: (row: Row) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, next: boolean) => void;
};

export default function MobileMenuItem({ row, orderNo, onEdit, onDelete, onToggleActive }: Props) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.5 }}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        {/* รูป + ลำดับซ้อนมุม */}
        <Box sx={{ position: "relative", flexShrink: 0 }}>
          <Avatar
            variant="rounded"
            src={row.image}
            alt={row.name}
            sx={{ width: 80, height: 80, borderRadius: 2, bgcolor: "grey.100" }}
            imgProps={{
              onError: (e) => (e.currentTarget.src = "https://via.placeholder.com/96x96.png?text=Menu"),
            }}
          />
          {typeof orderNo === "number" && (
            <Box
              aria-label={`ลำดับที่ ${orderNo}`}
              sx={{
                position: "absolute",
                top: 4,
                left: 4,
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                lineHeight: 1,
              }}
            >
              <Typography variant="caption" fontWeight={800}>
                {orderNo}
              </Typography>
            </Box>
          )}
        </Box>

        <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body1" fontWeight={800} noWrap>{row.name}</Typography>
          {row.description && (
            <Typography
              variant="body2" color="text.secondary"
              sx={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}
            >
              {row.description}
            </Typography>
          )}

          {/* 👇 แพทเทิร์นชิปเหมือน MobileCategoryItem */}
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
            <Chip
              size="small"
              variant="outlined"
              label={row.categoryName ?? row.categoryId}
              sx={{ height: 22, "& .MuiChip-label": { px: 0.75, fontSize: 12 } }}
            />
            <Chip
              size="small"
              variant="outlined"
              label={`ลำดับ ${orderNo ?? "-"}`}       // 👈 ชิป "ลำดับ n"
              sx={{ height: 22, "& .MuiChip-label": { px: 0.75, fontSize: 12 } }}
            />
          </Stack>
        </Stack>

        <Stack alignItems="flex-end" spacing={0.5} sx={{ pl: 0.5 }}>
          <Typography variant="subtitle2" fontWeight={900} whiteSpace="nowrap">
            {moneyTHB(row.price)}
          </Typography>

          <Stack direction="row" spacing={0.25} alignItems="center">
            <Tooltip title={row.isActive ? "ปิดขาย" : "เปิดขาย"}>
              <Switch size="small" checked={row.isActive} onChange={(_, v) => onToggleActive(row.id!, v)} />
            </Tooltip>
            <Tooltip title="แก้ไข">
              <IconButton size="small" onClick={() => onEdit(row)}><EditOutlinedIcon fontSize="small" /></IconButton>
            </Tooltip>
            <Tooltip title="ลบ">
              <IconButton size="small" color="error" onClick={() => onDelete(row.id!)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
            {row.updatedAt}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}