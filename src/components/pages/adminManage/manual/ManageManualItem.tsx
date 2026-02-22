 import {
  Avatar,
  Chip,
  IconButton,
  Stack,
  Switch,
  Tooltip,
  Typography,
  TableRow,
  TableCell,
  Box,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import PlaceIcon from "@mui/icons-material/Place"; // ไอคอนสถานที่
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"; // ไอคอน PDF
import type { Manual } from "../../../../@types/dto/Manual";

type Props = {
  row: Manual;
  index?: number;
  onEdit: (row: Manual) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, next: boolean) => void;
};

export default function ManageManualItem({
  row,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  // เช็กว่าเป็นไฟล์ PDF หรือไม่
  const isPdf = row.images?.some((img) => img.toLowerCase().endsWith(".pdf"));

  return (
    <TableRow hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
      {/* 1. ลำดับ */}
      <TableCell align="center" sx={{ width: 60 }}>
        <Typography variant="body2" fontWeight={800} color="text.secondary">
          {index ?? "-"}
        </Typography>
      </TableCell>

      {/* 2. รูป หรือ ไอคอนไฟล์ */}
      <TableCell width={100}>
        <Avatar
          variant="rounded"
          src={isPdf ? "" : row.images?.[0]} // ถ้าเป็น PDF ไม่ต้องโหลดรูป
          sx={{
            width: 64,
            height: 64,
            borderRadius: 2,
            bgcolor: isPdf ? "error.lighter" : "primary.lighter",
            color: isPdf ? "error.main" : "primary.main",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {isPdf ? <PictureAsPdfIcon /> : <DescriptionIcon />}
        </Avatar>
      </TableCell>

      {/* 3. หัวข้อ / สถานที่ - [ปรับปรุงใหม่] */}
      <TableCell sx={{ minWidth: 200 }}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" fontWeight={800} color="primary.main">
            {row.title || "ไม่มีชื่อหัวข้อ"}
          </Typography>

          {row.location && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <PlaceIcon sx={{ fontSize: 14, color: "text.disabled" }} />
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={500}
              >
                {row.location}
              </Typography>
            </Stack>
          )}

          <Box>
            <Chip
              label={row.category}
              size="small"
              sx={{
                height: 18,
                fontSize: "0.65rem",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            />
          </Box>
        </Stack>
      </TableCell>

      {/* 4. รายละเอียดเนื้อหา */}
      <TableCell sx={{ maxWidth: 250 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.4,
          }}
        >
          {row.content}
        </Typography>
      </TableCell>

      {/* 5. Target Role */}
      <TableCell sx={{ whiteSpace: "nowrap", width: 130 }}>
        <Chip
          size="small"
          label={row.targetRole}
          color={
            row.targetRole === "Admin"
              ? "error"
              : row.targetRole === "Customer"
                ? "primary"
                : "default"
          }
          variant="outlined"
          sx={{ fontWeight: "bold", borderRadius: 1 }}
        />
      </TableCell>

      {/* 6. สถานะการใช้งาน */}
      <TableCell sx={{ whiteSpace: "nowrap", width: 120 }}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Switch
            size="small"
            checked={row.isUsed}
            onChange={(_, v) => onToggleActive(row.id, v)}
            color="success"
          />
          <Typography
            variant="caption"
            fontWeight="bold"
            sx={{ color: row.isUsed ? "success.main" : "text.disabled" }}
          >
            {row.isUsed ? "เปิด" : "ปิด"}
          </Typography>
        </Stack>
      </TableCell>

      {/* 7. อัปเดตล่าสุด */}
      <TableCell sx={{ whiteSpace: "nowrap", width: 150 }}>
        <Typography variant="caption" display="block" color="text.secondary">
          {new Date(row.updateAt).toLocaleDateString("th-TH")}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {new Date(row.updateAt).toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          น.
        </Typography>
      </TableCell>

      {/* 8. ปุ่มจัดการ */}
      <TableCell align="right" sx={{ whiteSpace: "nowrap", width: 110 }}>
        <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
          <Tooltip title="แก้ไขข้อมูล">
            <IconButton
              onClick={() => onEdit(row)}
              size="small"
              sx={{
                bgcolor: "primary.lighter",
                color: "primary.main",
                "&:hover": { bgcolor: "primary.light" },
              }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="ลบถาวร">
            <IconButton
              onClick={() => onDelete(row.id)}
              size="small"
              color="error"
              sx={{
                bgcolor: "error.lighter",
                "&:hover": { bgcolor: "error.light" },
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
