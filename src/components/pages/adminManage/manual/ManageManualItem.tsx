import {
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
import PlaceIcon from "@mui/icons-material/Place";
import CollectionsIcon from "@mui/icons-material/Collections";
import { formatThaiDate, formatThaiTime } from "../../../../utility/utils";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useState } from "react";
import type { Manual } from "../../../../@types/dto/Manual";
import ManualFilesDialog from "./ManualFilesDialog";

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
  const [filesOpen, setFilesOpen] = useState(false);
  const images = row.images ?? [];
  const firstFile = images[0];
  const isFirstPdf = firstFile?.toLowerCase().endsWith(".pdf");

  return (
    <>
    <TableRow hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
      {/* 1. ลำดับ */}
      <TableCell align="center" sx={{ width: 60, py: 2.5 }}>
        <Typography sx={{ fontSize: "1.1rem", fontWeight: 800 }} color="text.secondary">
          {index ?? "-"}
        </Typography>
      </TableCell>

      {/* 2. Thumbnail เดียว + badge จำนวนไฟล์ */}
      <TableCell width={110} sx={{ py: 2.5 }}>
        {images.length === 0 ? (
          /* ไม่มีไฟล์ */
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 3,
              bgcolor: "grey.100",
              border: "1.5px dashed",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
            }}
          >
            <DescriptionIcon sx={{ fontSize: 28, color: "text.disabled" }} />
            <Typography sx={{ fontSize: "0.65rem", color: "text.disabled" }}>ไม่มีรูป</Typography>
          </Box>
        ) : (
          /* มีไฟล์ — thumbnail เดียว + badge */
          <Tooltip title={`ดูทั้งหมด (${images.length})`} arrow>
            <Box
              onClick={() => setFilesOpen(true)}
              sx={{
                position: "relative",
                width: 80,
                height: 80,
                borderRadius: 3,
                overflow: "hidden",
                border: "2px solid",
                borderColor: "divider",
                cursor: "pointer",
                bgcolor: isFirstPdf ? "#FFF5F5" : "grey.100",
                transition: "all 0.18s",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                  transform: "translateY(-2px)",
                },
                "&:hover .hover-overlay": { opacity: 1 },
              }}
            >
              {/* รูปหรือ PDF icon */}
              {isFirstPdf ? (
                <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                  <PictureAsPdfIcon sx={{ fontSize: 34, color: "error.main" }} />
                  <Typography sx={{ fontSize: "0.6rem", color: "error.main", fontWeight: 700 }}>PDF</Typography>
                </Box>
              ) : (
                <Box
                  component="img"
                  src={firstFile}
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
                  bgcolor: "rgba(0,0,0,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  transition: "opacity 0.15s",
                }}
              >
                <CollectionsIcon sx={{ color: "white", fontSize: 26 }} />
              </Box>

              {/* Badge จำนวนไฟล์ */}
              {images.length > 1 && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 4,
                    right: 4,
                    bgcolor: "rgba(0,0,0,0.65)",
                    color: "white",
                    borderRadius: "10px",
                    px: 0.75,
                    py: 0.15,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.3,
                  }}
                >
                  <CollectionsIcon sx={{ fontSize: 10 }} />
                  <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, lineHeight: 1.4 }}>
                    {images.length}
                  </Typography>
                </Box>
              )}
            </Box>
          </Tooltip>
        )}
      </TableCell>

      {/* 3. หัวข้อ / สถานที่ - [ปรับปรุงใหม่] */}
      <TableCell sx={{ minWidth: 200, py: 2.5 }}>
        <Stack spacing={0.75}>
          <Typography sx={{ fontSize: "1.15rem", fontWeight: 800 }} color="primary.main">
            {row.title || "ไม่มีชื่อหัวข้อ"}
          </Typography>

          {row.location && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <PlaceIcon sx={{ fontSize: 17, color: "text.disabled" }} />
              <Typography
                sx={{ fontSize: "1rem" }}
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
                height: 26,
                fontSize: "0.85rem",
                fontWeight: 700,
                textTransform: "uppercase",
                px: 0.5,
              }}
            />
          </Box>
        </Stack>
      </TableCell>

      {/* 4. รายละเอียดเนื้อหา */}
      <TableCell sx={{ maxWidth: 250, py: 2.5 }}>
        <Typography
          color="text.secondary"
          sx={{
            fontSize: "1rem",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.6,
          }}
        >
          {row.content}
        </Typography>
      </TableCell>

      {/* 5. Target Role */}
      <TableCell sx={{ whiteSpace: "nowrap", width: 130, py: 2.5 }}>
        <Chip
          label={row.targetRole}
          color={
            row.targetRole === "Admin"
              ? "error"
              : row.targetRole === "Customer"
                ? "primary"
                : "default"
          }
          variant="outlined"
          sx={{ fontWeight: "bold", borderRadius: 1, fontSize: "0.9rem" }}
        />
      </TableCell>

      {/* 6. สถานะการใช้งาน */}
      <TableCell sx={{ whiteSpace: "nowrap", width: 120, py: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Switch
            checked={row.isUsed}
            onChange={(_, v) => onToggleActive(row.id, v)}
            color="success"
          />
          <Typography
            sx={{ fontSize: "1rem", fontWeight: 700, color: row.isUsed ? "success.main" : "text.disabled" }}
          >
            {row.isUsed ? "เปิด" : "ปิด"}
          </Typography>
        </Stack>
      </TableCell>

      {/* 7. อัปเดตล่าสุด */}
      <TableCell sx={{ whiteSpace: "nowrap", width: 150, py: 2.5 }}>
        <Typography sx={{ fontSize: "1rem", fontWeight: 600 }} display="block" color="text.secondary">
          {formatThaiDate(row.updateAt)}
        </Typography>
        <Typography sx={{ fontSize: "0.9rem" }} color="text.disabled">
          {formatThaiTime(row.updateAt)}{" "}น.
        </Typography>
      </TableCell>

      {/* 8. ปุ่มจัดการ */}
      <TableCell align="right" sx={{ whiteSpace: "nowrap", width: 110, py: 2.5 }}>
        <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
          <Tooltip title="แก้ไขข้อมูล">
            <IconButton
              onClick={() => onEdit(row)}
              sx={{
                bgcolor: "primary.lighter",
                color: "primary.main",
                "&:hover": { bgcolor: "primary.light" },
              }}
            >
              <EditOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="ลบถาวร">
            <IconButton
              onClick={() => onDelete(row.id)}
              color="error"
              sx={{
                bgcolor: "error.lighter",
                "&:hover": { bgcolor: "error.light" },
              }}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>

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
