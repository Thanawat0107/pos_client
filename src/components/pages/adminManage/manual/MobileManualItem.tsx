/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Avatar,
  Chip,
  IconButton,
  Paper,
  Stack,
  Switch,
  Typography,
  Box,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import PlaceIcon from "@mui/icons-material/Place";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
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
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  // เช็กว่าเป็นไฟล์ PDF หรือไม่
  const isPdf = row.fileUrl?.toLowerCase().endsWith(".pdf");

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: 2, bgcolor: "white" }}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        {/* รูป หรือ ไอคอนไฟล์ */}
        <Avatar
          variant="rounded"
          src={isPdf ? "" : row.fileUrl}
          sx={{
            width: 70,
            height: 70,
            borderRadius: 2,
            bgcolor: isPdf ? "error.lighter" : "primary.lighter",
            color: isPdf ? "error.main" : "primary.main",
            flexShrink: 0,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {isPdf ? (
            <PictureAsPdfIcon fontSize="small" />
          ) : (
            <DescriptionIcon fontSize="small" />
          )}
        </Avatar>

        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
          {/* ส่วนหัว: Title และ Role */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1}
          >
            <Typography
              variant="subtitle2"
              fontWeight={800}
              color="primary.main"
              noWrap
              sx={{ flex: 1 }}
            >
              {row.title || "ไม่มีชื่อหัวข้อ"}
            </Typography>
            <Chip
              size="small"
              label={row.targetRole}
              variant="filled"
              color={row.targetRole === "Admin" ? "error" : "primary"}
              sx={{ height: 18, fontSize: 9, fontWeight: 700 }}
            />
          </Stack>

          {/* สถานที่ (Location) */}
          {row.location && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <PlaceIcon sx={{ fontSize: 12, color: "text.disabled" }} />
              <Typography variant="caption" color="text.secondary">
                {row.location}
              </Typography>
            </Stack>
          )}

          {/* เนื้อหา (Content) */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.3,
              mt: 0.5,
            }}
          >
            {row.content}
          </Typography>

          {/* Footer: วันที่ และ ปุ่มจัดการ */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            pt={1.5}
          >
            <Box>
              <Typography
                variant="caption"
                color="text.disabled"
                display="block"
                sx={{ fontSize: 10 }}
              >
                แก้ไขเมื่อ: {new Date(row.updateAt).toLocaleDateString("th-TH")}
              </Typography>
            </Box>

            <Stack direction="row" spacing={0.5} alignItems="center">
              {/* สวิตซ์เปิด/ปิด */}
              <Stack direction="row" alignItems="center" mr={1}>
                <Switch
                  size="small"
                  checked={row.isUsed}
                  onChange={(_, v) => onToggleActive(row.id, v)}
                  color="success"
                />
              </Stack>

              {/* ปุ่มแก้ไข */}
              <IconButton
                size="small"
                onClick={() => onEdit(row)}
                sx={{ bgcolor: "primary.lighter", color: "primary.main" }}
              >
                <EditOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>

              {/* ปุ่มลบ */}
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(row.id)}
                sx={{ bgcolor: "error.lighter" }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}
