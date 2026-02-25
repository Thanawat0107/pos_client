import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
  Zoom,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ImageIcon from "@mui/icons-material/Image";
import { getImage } from "../../../../helpers/imageHelper";

type Props = {
  open: boolean;
  onClose: () => void;
  images: string[];
  title?: string;
};

function FileCard({ src, index }: { src: string; index: number }) {
  const isPdf = src.toLowerCase().endsWith(".pdf");
  const filename = src.split("/").pop() ?? `รูปที่ ${index + 1}`;

  return (
    <Zoom in style={{ transitionDelay: `${index * 40}ms` }}>
      <Box
        sx={{
          position: "relative",
          aspectRatio: "16/10",
          borderRadius: 3,
          overflow: "hidden",
          border: "2px solid",
          borderColor: "divider",
          bgcolor: isPdf ? "#FFF5F5" : "grey.100",
        }}
      >
        {isPdf ? (
          /* PDF card */
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              p: 1,
            }}
          >
            <PictureAsPdfIcon sx={{ fontSize: 72, color: "error.main", opacity: 0.85 }} />
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "error.main",
                textAlign: "center",
                wordBreak: "break-all",
                lineHeight: 1.3,
                px: 1,
              }}
            >
              {filename}
            </Typography>
          </Box>
        ) : (
          /* Image card */
          <Box
            component="img"
            src={getImage(src)}
            alt={filename}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        )}

        {/* Index badge */}
        <Box
          sx={{
            position: "absolute",
            top: 6,
            left: 6,
            bgcolor: "rgba(0,0,0,0.55)",
            color: "white",
            borderRadius: "50%",
            width: 22,
            height: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography sx={{ fontSize: "0.68rem", fontWeight: 800 }}>{index + 1}</Typography>
        </Box>
      </Box>
    </Zoom>
  );
}

export default function ManualFilesDialog({ open, onClose, images, title }: Props) {
  const imageCount = images.filter((s) => !s.toLowerCase().endsWith(".pdf")).length;
  const pdfCount = images.filter((s) => s.toLowerCase().endsWith(".pdf")).length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, overflow: "hidden" },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "grey.50",
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: "text.primary" }}>
            รูปทั้งหมด
          </Typography>
          {title && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
              {title}
            </Typography>
          )}
          <Box sx={{ display: "flex", gap: 0.75, mt: 1, flexWrap: "wrap" }}>
            <Chip
              size="small"
              label={`${images.length} รายการ`}
              sx={{ fontWeight: 700, bgcolor: "primary.50", color: "primary.main", border: "1px solid", borderColor: "primary.200" }}
            />
            {imageCount > 0 && (
              <Chip
                icon={<ImageIcon sx={{ fontSize: "0.9rem !important" }} />}
                size="small"
                label={`รูปภาพ ${imageCount}`}
                sx={{ fontWeight: 600, fontSize: "0.75rem" }}
              />
            )}
            {pdfCount > 0 && (
              <Chip
                icon={<PictureAsPdfIcon sx={{ fontSize: "0.9rem !important" }} />}
                size="small"
                label={`PDF ${pdfCount}`}
                color="error"
                variant="outlined"
                sx={{ fontWeight: 600, fontSize: "0.75rem" }}
              />
            )}
          </Box>
        </Box>

        <Tooltip title="ปิด">
          <IconButton onClick={onClose} size="small" sx={{ bgcolor: "grey.200", "&:hover": { bgcolor: "grey.300" } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      {/* Grid content */}
      <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
        {images.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <ImageIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography color="text.secondary">ไม่มีรูปภาพ</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: { xs: 2, md: 2.5 },
            }}
          >
            {images.map((src, i) => (
              <FileCard key={i} src={src} index={i} />
            ))}
          </Box>
        )}

      </DialogContent>
    </Dialog>
  );
}
