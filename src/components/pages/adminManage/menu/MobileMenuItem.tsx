import {
  Avatar,
  Chip,
  IconButton,
  Paper,
  Stack,
  Switch,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { MenuItemDto } from "../../../../@types/dto/MenuItem";

// ฟังก์ชันจัดรูปแบบเงินบาท
const moneyTHB = (n: number) =>
  n.toLocaleString("th-TH", { style: "currency", currency: "THB" });

type Props = {
  row: MenuItemDto;
  index?: number;
  onEdit: (row: MenuItemDto) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, next: boolean) => void;
};

export default function MobileMenuItem({
  row,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
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

      <Stack spacing={0} sx={{ pl: 2, pr: 2, pt: 2, pb: 1.5 }}>
        {/* Row บน: รูป + ข้อมูล + ราคา */}
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {/* รูปภาพ + เลขลำดับ */}
          <Box sx={{ position: "relative", flexShrink: 0 }}>
            <Avatar
              variant="rounded"
              src={row.imageUrl || ""}
              alt={row.name}
              imgProps={{
                onError: (e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/96x96.png?text=No+Img";
                },
              }}
              sx={{
                width: 80,
                height: 80,
                borderRadius: 2.5,
                bgcolor: "grey.100",
                border: "1.5px solid",
                borderColor: "divider",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: -7,
                left: -7,
                bgcolor: "grey.800",
                color: "white",
                width: 22,
                height: 22,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: 800,
                border: "2px solid white",
              }}
            >
              {index}
            </Box>
          </Box>

          {/* ชื่อ + คำอธิบาย + แท็ก */}
          <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{ fontSize: "1.05rem", fontWeight: 800, lineHeight: 1.3 }}
              noWrap
            >
              {row.name}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                fontSize: "0.875rem",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.4,
              }}
            >
              {row.description || "ไม่มีรายละเอียด"}
            </Typography>

            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              <Chip
                label={row.menuCategoryName ?? "ไม่มีหมวดหมู่"}
                size="small"
                variant="outlined"
                sx={{ height: 22, fontSize: "0.75rem", fontWeight: 600 }}
              />
              {row.menuItemOptionGroups?.length > 0 && (
                <Chip
                  label={`${row.menuItemOptionGroups.length} ตัวเลือก`}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    bgcolor: "primary.lighter",
                    color: "primary.main",
                  }}
                />
              )}
            </Stack>
          </Stack>

          {/* ราคา */}
          <Typography
            sx={{ fontSize: "1.1rem", fontWeight: 900, flexShrink: 0 }}
            color="primary.main"
          >
            {moneyTHB(row.basePrice)}
          </Typography>
        </Stack>

        <Divider sx={{ borderStyle: "dashed", my: 1.5 }} />

        {/* Row ล่าง: สถานะ + วันที่ + ปุ่ม */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Switch
              checked={isActive}
              onChange={(_, v) => onToggleActive(row.id, v)}
              color="success"
              size="small"
            />
            <Typography
              sx={{ fontSize: "0.875rem", fontWeight: 700 }}
              color={isActive ? "success.main" : "text.disabled"}
            >
              {isActive ? "เปิดขายอยู่" : "ปิดการขาย"}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.25} alignItems="center">
            <Typography sx={{ fontSize: "0.8rem" }} color="text.disabled">
              {new Date(row.updatedAt).toLocaleDateString("th-TH")}
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
              <EditOutlinedIcon sx={{ fontSize: "1.2rem" }} />
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
              <DeleteOutlineIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}