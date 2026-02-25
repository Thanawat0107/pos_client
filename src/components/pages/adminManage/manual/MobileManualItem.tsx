 import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Switch,
  Tooltip,
  Typography,
  Divider,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CollectionsIcon from "@mui/icons-material/Collections";
import PlaceIcon from "@mui/icons-material/Place";
import { useState } from "react";
import type { Manual } from "../../../../@types/dto/Manual";
import ManualFilesDialog from "./ManualFilesDialog";
import { getImage } from "../../../../helpers/imageHelper";

type Props = {
  row: Manual;
  index?: number;
  onEdit: (row: Manual) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, next: boolean) => void;
};

export default function MobileManualItem({
  row,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  const [filesOpen, setFilesOpen] = useState(false);
  const images = row.images ?? [];
  const firstFile = images[0];
  const isFirstPdf = firstFile?.toLowerCase().endsWith(".pdf");

  return (
    <>
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        p: 2,
        bgcolor: "background.paper",
        borderColor: row.isUsed ? "divider" : "action.disabledBackground",
        transition: "0.2s",
      }}
    >
      <Stack spacing={1.5}>
        {/* ส่วนที่ 1: หัวข้อ + สถานะ */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2 }} noWrap>
              {row.title || "ไม่มีชื่อหัวข้อ"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {row.id}{index !== undefined ? ` • ลำดับที่ ${index}` : ""}
            </Typography>
          </Stack>

          <Chip
            size="small"
            label={row.isUsed ? "เปิดใช้งาน" : "ปิดใช้งาน"}
            color={row.isUsed ? "success" : "default"}
            variant={row.isUsed ? "filled" : "outlined"}
            sx={{ fontWeight: 700, height: 24, flexShrink: 0 }}
          />
        </Stack>

        {/* ส่วนที่ 2: Location */}
        {row.location && (
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <PlaceIcon sx={{ fontSize: 13, color: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary">
              {row.location}
            </Typography>
          </Stack>
        )}

        {/* ส่วนที่ 3: Thumbnail เดียว + badge + คลิกเปิด Dialog */}
        {images.length > 0 && (
          <Tooltip title={`ดูทั้งหมด (${images.length})`} arrow>
            <Box
              onClick={() => setFilesOpen(true)}
              sx={{
                position: "relative",
                width: "100%",
                height: 130,
                borderRadius: 2.5,
                overflow: "hidden",
                border: "2px solid",
                borderColor: "divider",
                cursor: "pointer",
                bgcolor: isFirstPdf ? "#FFF5F5" : "grey.100",
                transition: "all 0.18s",
                "&:hover": { borderColor: "primary.main", boxShadow: "0 4px 14px rgba(0,0,0,0.12)" },
                "&:hover .hover-overlay": { opacity: 1 },
              }}
            >
              {isFirstPdf ? (
                <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
                  <PictureAsPdfIcon sx={{ fontSize: 44, color: "error.main" }} />
                  <Typography sx={{ fontSize: "0.75rem", color: "error.main", fontWeight: 700 }}>PDF</Typography>
                </Box>
              ) : (
                <Box
                  component="img"
                  src={getImage(firstFile)}
                  alt="preview"
                  sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              )}

              {/* Hover overlay */}
              <Box
                className="hover-overlay"
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "rgba(0,0,0,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.15s",
                }}
              >
                <CollectionsIcon sx={{ color: "white", fontSize: 32 }} />
              </Box>

              {/* Badge จำนวนไฟล์ */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  bgcolor: "rgba(0,0,0,0.6)",
                  color: "white",
                  borderRadius: "12px",
                  px: 1,
                  py: 0.3,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <CollectionsIcon sx={{ fontSize: 13 }} />
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 800 }}>{images.length}</Typography>
              </Box>
            </Box>
          </Tooltip>
        )}

        {/* ส่วนที่ 4: Chips แสดงคุณสมบัติ */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            label={row.targetRole}
            size="small"
            color={row.targetRole === "Admin" ? "error" : row.targetRole === "Customer" ? "primary" : "default"}
            variant="filled"
            sx={{ fontSize: "0.7rem", fontWeight: 700 }}
          />
          <Chip
            label={row.category}
            size="small"
            variant="outlined"
            sx={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}
          />
        </Stack>

        <Divider sx={{ borderStyle: "dashed" }} />

        {/* ส่วนที่ 5: Toggle & Actions */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
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
              {row.isUsed ? "พร้อมใช้งาน" : "ปิดชั่วคราว"}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <IconButton
              size="medium"
              onClick={() => onEdit(row)}
              sx={{ bgcolor: "primary.50", color: "primary.main", "&:hover": { bgcolor: "primary.100" } }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>

            <IconButton
              size="medium"
              color="error"
              onClick={() => onDelete(row.id)}
              sx={{ bgcolor: "error.50", color: "error.main", "&:hover": { bgcolor: "error.100" } }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>
    </Paper>

    {/* Dialog แสดงไฟล์ทั้งหมด */}
    <ManualFilesDialog
      open={filesOpen}
      onClose={() => setFilesOpen(false)}
      images={images}
      title={row.title}
    />
    </>
  );
}