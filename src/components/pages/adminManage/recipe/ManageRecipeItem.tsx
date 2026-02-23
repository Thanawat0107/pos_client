import {
  IconButton,
  Stack,
  Switch,
  Tooltip,
  Typography,
  TableRow,
  TableCell,
  Chip,
  Box,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import type { Recipe } from "../../../../@types/dto/Recipe";
import { formatThaiDate } from "../../../../utility/utils";

type Props = {
  row: Recipe;
  index?: number;
  onEdit: (row: Recipe) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, next: boolean) => void;
};

export default function ManageRecipeItem({
  row,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  const accentColor = row.isUsed ? "#22C55E" : "#D1D5DB";
  const bgHover = row.isUsed ? "#F0FDF4" : "#F9FAFB";

  return (
    <TableRow
      sx={{
        transition: "background-color 0.15s",
        "&:hover": { bgcolor: bgHover },
        "& td:first-of-type": {
          borderLeft: `3px solid ${accentColor}`,
        },
      }}
    >
      {/* # */}
      <TableCell
        align="center"
        sx={{ pl: 3, width: 70, py: 2.5, fontWeight: 800, fontSize: "1rem", color: "text.secondary" }}
      >
        {index ?? "-"}
      </TableCell>

      {/* เมนูอาหาร */}
      <TableCell sx={{ py: 2.5 }}>
        <Stack spacing={0.75}>
          <Typography fontWeight={800} noWrap sx={{ fontSize: "1.1rem" }}>
            {row.menuItemName || `Menu ID: ${row.menuItemId}`}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                bgcolor: "#F1F5F9",
                borderRadius: "50px",
                px: 1.25,
                py: 0.3,
              }}
            >
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }} color="text.secondary">
                v.{row.version}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "0.85rem" }} color="text.secondary">
              {formatThaiDate(row.createdAt)}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      {/* วิธีทำ (ย่อ) */}
      <TableCell sx={{ py: 2.5 }}>
        <Typography
          color="text.secondary"
          sx={{
            fontSize: "0.95rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            whiteSpace: "normal",
            lineHeight: 1.65,
          }}
        >
          {row.instructions}
        </Typography>
      </TableCell>

      {/* สถานะ */}
      <TableCell align="center" sx={{ width: 160, py: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
          <Tooltip title={row.isUsed ? "คลิกเพื่อปิดใช้งาน" : "คลิกเพื่อเปิดใช้งาน"}>
            <Switch
              checked={row.isUsed}
              onChange={(_, v) => onToggleActive(row.id, v)}
              color="success"
            />
          </Tooltip>
          <Chip
            icon={
              row.isUsed
                ? <CheckCircleIcon sx={{ fontSize: "1rem !important" }} />
                : <PauseCircleOutlineIcon sx={{ fontSize: "1rem !important" }} />
            }
            label={row.isUsed ? "ใช้งาน" : "ปิด"}
            sx={
              row.isUsed
                ? {
                    bgcolor: "#F0FDF4",
                    color: "#15803D",
                    border: "1.5px solid #BBF7D0",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    height: 30,
                    "& .MuiChip-icon": { color: "#15803D" },
                  }
                : {
                    bgcolor: "#F9FAFB",
                    color: "#6B7280",
                    border: "1.5px solid #E5E7EB",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    height: 30,
                  }
            }
          />
        </Stack>
      </TableCell>

      {/* จัดการ */}
      <TableCell align="right" sx={{ pr: 3, width: 140, py: 2.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
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
          <Tooltip title="ลบสูตร">
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