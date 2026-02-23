import {
  Paper,
  Stack,
  Typography,
  Chip,
  Switch,
  IconButton,
  Box,
  Avatar,
  Divider,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import type { Recipe } from "../../../../@types/dto/Recipe";
import { formatThaiDate } from "../../../../utility/utils";

type MobileRecipeItemProps = {
  row: Recipe;
  index: number;
  onEdit: (row: Recipe) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, value: boolean) => void;
};

export default function MobileRecipeItem({
  row,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}: MobileRecipeItemProps) {
  const isActive = row.isUsed;

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        p: 0,
        borderColor: isActive ? "divider" : "error.lighter",
        bgcolor: isActive ? "background.paper" : "grey.50",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* แถบสีสถานะด้านซ้าย */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          bgcolor: isActive ? "success.main" : "grey.400",
        }}
      />

      <Stack spacing={0} sx={{ pl: 2.5, pr: 2, pt: 2.5, pb: 2 }}>
        {/* Row บน: ไอคอน + ข้อมูล */}
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {/* ไอคอน + เลขลำดับ */}
          <Box sx={{ position: "relative", flexShrink: 0 }}>
            <Avatar
              variant="rounded"
              sx={{
                width: 88,
                height: 88,
                borderRadius: 2.5,
                bgcolor: "#FFF1F2",
                border: "1.5px solid #FECDD3",
              }}
            >
              <MenuBookIcon sx={{ fontSize: "2.5rem", color: "#D32F2F" }} />
            </Avatar>
            <Box
              sx={{
                position: "absolute",
                top: -8,
                left: -8,
                bgcolor: "grey.800",
                color: "white",
                width: 26,
                height: 26,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
                fontWeight: 800,
                border: "2px solid white",
              }}
            >
              {index}
            </Box>
          </Box>

          {/* ชื่อ + รายละเอียด + แท็ก */}
          <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{ fontSize: "1.2rem", fontWeight: 800, lineHeight: 1.3 }}
              noWrap
            >
              {row.menuItemName || `Menu #${row.menuItemId}`}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                fontSize: "0.95rem",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.55,
              }}
            >
              {row.instructions || "ไม่มีวิธีทำ"}
            </Typography>

            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              <Chip
                label={`เวอร์ชัน ${row.version}`}
                size="small"
                variant="outlined"
                sx={{ height: 26, fontSize: "0.85rem", fontWeight: 700, px: 0.5 }}
              />
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ borderStyle: "dashed", my: 2 }} />

        {/* Row ล่าง: สถานะ + วันที่ + ปุ่ม */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Switch
              checked={isActive}
              onChange={(_, v) => onToggleActive(row.id, v)}
              color="success"
            />
            <Typography
              sx={{ fontSize: "1rem", fontWeight: 700 }}
              color={isActive ? "success.main" : "text.disabled"}
            >
              {isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.25} alignItems="center">
            <Typography sx={{ fontSize: "0.9rem" }} color="text.disabled">
              {formatThaiDate(row.createdAt)}
            </Typography>
            <IconButton
              onClick={() => onEdit(row)}
              sx={{
                p: 1,
                bgcolor: "info.lighter",
                color: "info.main",
                "&:hover": { bgcolor: "info.light" },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: "1.4rem" }} />
            </IconButton>
            <IconButton
              onClick={() => onDelete(row.id)}
              sx={{
                p: 1,
                bgcolor: "error.lighter",
                color: "error.main",
                "&:hover": { bgcolor: "error.light" },
              }}
            >
              <DeleteOutlineIcon sx={{ fontSize: "1.4rem" }} />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}

