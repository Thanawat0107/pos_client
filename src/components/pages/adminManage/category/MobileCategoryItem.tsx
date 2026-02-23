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
import CategoryIcon from "@mui/icons-material/Category";
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
  const isActive = row.isUsed && !row.isDeleted;

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
        {/* Row บน: ไอคอน + ชื่อ */}
        <Stack direction="row" spacing={2} alignItems="center">
          {/* ไอคอน + เลขลำดับ */}
          <Box sx={{ position: "relative", flexShrink: 0 }}>
            <Avatar
              variant="rounded"
              sx={{
                width: 72,
                height: 72,
                borderRadius: 2.5,
                bgcolor: "#FFF1F2",
                border: "1.5px solid #FECDD3",
              }}
            >
              <CategoryIcon sx={{ fontSize: "2rem", color: "#D32F2F" }} />
            </Avatar>
            <Box
              sx={{
                position: "absolute",
                top: -8,
                left: -8,
                bgcolor: "grey.800",
                color: "white",
                width: 24,
                height: 24,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.78rem",
                fontWeight: 800,
                border: "2px solid white",
              }}
            >
              {index}
            </Box>
          </Box>

          {/* ชื่อ + แท็กสถานะ */}
          <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{ fontSize: "1.2rem", fontWeight: 800, lineHeight: 1.3 }}
              noWrap
            >
              {row.name}
            </Typography>
            <Chip
              label={isActive ? "พร้อมใช้" : "ปิดใช้งาน"}
              size="small"
              sx={{
                alignSelf: "flex-start",
                height: 26,
                fontSize: "0.85rem",
                fontWeight: 700,
                ...(isActive
                  ? { bgcolor: "#F0FDF4", color: "#15803D", border: "1.5px solid #BBF7D0" }
                  : { bgcolor: "#F9FAFB", color: "#6B7280", border: "1.5px solid #E5E7EB" }),
              }}
            />
          </Stack>
        </Stack>

        <Divider sx={{ borderStyle: "dashed", my: 2 }} />

        {/* Row ล่าง: Switch + ปุ่ม */}
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

          <Stack direction="row" spacing={1}>
            <IconButton
              onClick={() => onEdit(row)}
              sx={{
                p: 1,
                bgcolor: "info.lighter",
                color: "info.main",
                "&:hover": { bgcolor: "info.light" },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: "1.3rem" }} />
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
              <DeleteOutlineIcon sx={{ fontSize: "1.3rem" }} />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}
