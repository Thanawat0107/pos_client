/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Avatar,
  Chip,
  IconButton,
  Paper,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { Row } from "./ManageMenuItem";

const moneyTHB = (n: number) =>
  n.toLocaleString("th-TH", { style: "currency", currency: "THB" });

type Props = {
  row: Row;
  index?: number; // ใช้แสดงในชิปเท่านั้น
  onEdit: (row: Row) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, next: boolean) => void;
  showOrderOnImage?: boolean;
};

export default function MobileMenuItem({
  row,
  index,
  onEdit,
  onDelete,
  onToggleActive,
  showOrderOnImage = false,
}: Props) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.5 }}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        {/* รูปอย่างเดียว (ไม่มีเลขซ้อนทับ) */}
        <Avatar
          variant="rounded"
           src={row.image || "https://via.placeholder.com/96x96.png?text=Menu"}
          alt={row.name}
          sx={{
            width: 80,
            height: 80,
            borderRadius: 2,
            bgcolor: "grey.100",
            flexShrink: 0,
          }}
          imgProps={{
            onError: (e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/96x96.png?text=Menu";
            },
          }}
        />

        <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body1" fontWeight={800} noWrap>
             {row.name}
          </Typography>
              {row.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {row.description}
            </Typography>
          )}

          {/* ชิปข้อมูล */}
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            flexWrap="wrap"
          >
            <Chip
              size="small"
              variant="outlined"
              label={row.categoryName ?? row.categoryId}
              sx={{
                height: 22,
                "& .MuiChip-label": { px: 0.75, fontSize: 12 },
              }}
            />
            <Chip
              size="small"
              variant="outlined"
              label={`ลำดับ ${index ?? "-"}`} // แสดงลำดับที่นี่เท่านั้น
              sx={{
                height: 22,
                "& .MuiChip-label": { px: 0.75, fontSize: 12 },
              }}
            />
          </Stack>
        </Stack>

        <Stack alignItems="flex-end" spacing={0.5} sx={{ pl: 0.5 }}>
          <Typography variant="subtitle2" fontWeight={900} whiteSpace="nowrap">
             {moneyTHB(row.price)}
          </Typography>

          <Stack direction="row" spacing={0.25} alignItems="center">
            <Tooltip title={row.isActive ? "ปิดขาย" : "เปิดขาย"}>
              <Switch
                size="small"
                 checked={row.isActive}
                onChange={(_, v) => onToggleActive(row.id!, v)}
              />
            </Tooltip>
            <Tooltip title="แก้ไข">
                <IconButton size="small" onClick={() => onEdit(row)}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="ลบ">
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(row.id!)}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ lineHeight: 1.2 }}
          >
             {row.updatedAt}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
