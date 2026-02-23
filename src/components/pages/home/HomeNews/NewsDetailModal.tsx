import {
  Dialog,
  Box,
  Stack,
  Typography,
  IconButton,
  Chip,
  Divider,
  Tooltip,
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import { alpha, keyframes } from "@mui/material/styles";
import { useState } from "react";
import type { Content } from "../../../../@types/dto/Content";
import { ContentType } from "../../../../@types/Enum";
import { formatThaiDate } from "../../../../utility/utils";
import { getImage, getTypeConfig } from "./newsHelpers";
import TypeChip from "./TypeChip";

const popIn = keyframes`
  from { opacity: 0; transform: scale(0.97); }
  to   { opacity: 1; transform: scale(1); }
`;

interface NewsDetailModalProps {
  item: Content | null;
  onClose: () => void;
}

// \u2500\u2500\u2500 Promo Code Box \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function PromoCodeBox({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        mt: 1.5, px: 2, py: 1.5, borderRadius: 2,
        border: (theme) => `2px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
      }}
    >
      <Stack>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>\u0e42\u0e04\u0e49\u0e14\u0e2a\u0e48\u0e27\u0e19\u0e25\u0e14</Typography>
        <Typography variant="h6" fontWeight={900} letterSpacing={3} color="primary.main">{code}</Typography>
      </Stack>
      <Tooltip title={copied ? "\u0e04\u0e31\u0e14\u0e25\u0e2d\u0e01\u0e41\u0e25\u0e49\u0e27!" : "\u0e04\u0e31\u0e14\u0e25\u0e2d\u0e01\u0e42\u0e04\u0e49\u0e14"} placement="top">
        <IconButton
          onClick={handleCopy}
          size="small"
          sx={{
            bgcolor: copied
              ? (theme) => alpha(theme.palette.success.main, 0.12)
              : (theme) => alpha(theme.palette.primary.main, 0.08),
            color: copied ? "success.main" : "primary.main",
            transition: "all 0.2s",
          }}
        >
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

// \u2500\u2500\u2500 Promo Section \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function PromoSection({ item }: { item: Content }) {
  if (item.contentType !== ContentType.PROMOTION) return null;
  return (
    <Box>
      <Divider sx={{ my: 2 }} />
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <LocalOfferOutlinedIcon sx={{ fontSize: 16, color: "secondary.main" }} />
          <Typography variant="subtitle2" fontWeight={800} color="secondary.main">\u0e23\u0e32\u0e22\u0e25\u0e30\u0e40\u0e2d\u0e35\u0e22\u0e14\u0e42\u0e1b\u0e23\u0e42\u0e21\u0e0a\u0e31\u0e48\u0e19</Typography>
        </Stack>
        {item.discountValue != null && (
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Chip
              label={item.discountType === "percent" ? `\u0e25\u0e14 ${item.discountValue}%` : `\u0e25\u0e14 \u0e3f${item.discountValue.toLocaleString()}`}
              size="small"
              sx={{ fontWeight: 800, bgcolor: (t) => alpha(t.palette.error.main, 0.1), color: "error.main", border: (t) => `1px solid ${alpha(t.palette.error.main, 0.2)}` }}
            />
            {item.minOrderAmount != null && (
              <Chip label={`\u0e02\u0e31\u0e49\u0e19\u0e15\u0e48\u0e33 \u0e3f${item.minOrderAmount.toLocaleString()}`} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
            )}
          </Stack>
        )}
        {item.maxUsageCount != null && (
          <Typography variant="caption" color="text.secondary">\u0e43\u0e0a\u0e49\u0e41\u0e25\u0e49\u0e27 {item.currentUsageCount} / {item.maxUsageCount} \u0e04\u0e23\u0e31\u0e49\u0e07</Typography>
        )}
        {item.maxUsagePerUser != null && (
          <Typography variant="caption" color="text.secondary">\u0e43\u0e0a\u0e49\u0e44\u0e14\u0e49 {item.maxUsagePerUser} \u0e04\u0e23\u0e31\u0e49\u0e07 / \u0e04\u0e19</Typography>
        )}
        {item.endDate && (
          <Stack direction="row" alignItems="center" spacing={0.8}>
            <EventAvailableOutlinedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
            <Typography variant="caption" color="text.disabled" fontWeight={600}>
              \u0e2b\u0e21\u0e14\u0e2d\u0e32\u0e22\u0e38 {formatThaiDate(item.endDate, { day: "numeric", month: "long", year: "numeric" })}
            </Typography>
          </Stack>
        )}
        {item.promoCode && <PromoCodeBox code={item.promoCode} />}
      </Stack>
    </Box>
  );
}

// \u2500\u2500\u2500 Main Modal (IG Post Layout) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
export default function NewsDetailModal({ item, onClose }: NewsDetailModalProps) {
  if (!item) return null;

  const image = getImage(item.imageUrl);
  const cfg = getTypeConfig(item.contentType);

  return (
    <Dialog
      open={!!item}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: { xs: 2, md: 3 },
          overflow: "hidden",
          animation: `${popIn} 0.22s ease both`,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          maxHeight: { xs: "92vh", md: 580 },
          height: { md: 580 },
        },
      }}
      slotProps={{
        backdrop: { sx: { backdropFilter: "blur(8px)", bgcolor: "rgba(0,0,0,0.6)" } },
      }}
    >
      {/* \u2550\u2550\u2550 \u0e0b\u0e49\u0e32\u0e22: \u0e23\u0e39\u0e1b (IG post) \u2550\u2550\u2550 */}
      <Box
        sx={{
          position: "relative",
          width: { xs: "100%", md: "58%" },
          flexShrink: 0,
          bgcolor: "black",
          paddingBottom: { xs: "75%", md: 0 },
          alignSelf: { md: "stretch" },
        }}
      >
        <Box
          component="img"
          src={image}
          alt={item.title}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, bgcolor: cfg.color }} />
      </Box>

      {/* \u2550\u2550\u2550 \u0e02\u0e27\u0e32: \u0e40\u0e19\u0e37\u0e49\u0e2d\u0e2b\u0e32 (IG post right panel) \u2550\u2550\u2550 */}
      <Stack
        sx={{
          width: { xs: "100%", md: "42%" },
          flexShrink: 0,
          bgcolor: "background.paper",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header (IG-style) */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            px: 2, py: 1.5,
            borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.15)}`,
            flexShrink: 0,
          }}
        >
          <Avatar sx={{ width: 36, height: 36, bgcolor: cfg.color, fontSize: "0.8rem", fontWeight: 800 }}>
            {cfg.label.charAt(0)}
          </Avatar>
          <Stack sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={800} lineHeight={1.2}>{cfg.label}</Typography>
            <Typography variant="caption" color="text.disabled" lineHeight={1.1}>
              {formatThaiDate(item.createdAt, { day: "numeric", month: "short", year: "numeric" })}
            </Typography>
          </Stack>
          <TypeChip contentType={item.contentType} />
          <IconButton size="small" onClick={onClose} sx={{ ml: 0.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Caption / Content */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2 }}>
          <Typography sx={{ fontWeight: 900, fontSize: "1.05rem", lineHeight: 1.4, mb: item.description ? 1.5 : 0 }}>
            {item.title}
          </Typography>
          {item.description && (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75, whiteSpace: "pre-line" }}>
              {item.description}
            </Typography>
          )}
          <PromoSection item={item} />
        </Box>
      </Stack>
    </Dialog>
  );
}
