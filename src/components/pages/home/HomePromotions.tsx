import { useState } from "react";
import { Container, Stack, Typography, Box, Card, Button, Chip } from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import type { Content } from "../../../@types/dto/Content";

// --- Sub Component: Modern CouponCard ---
function CouponCard({ item }: { item: Content }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (item.promoCode) {
      navigator.clipboard.writeText(item.promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isPercent = item.discountType === "Percent";

  return (
    <Card 
      sx={{ 
        minWidth: 280, 
        maxWidth: 280, 
        borderRadius: 5, 
        border: "none", 
        position: "relative",
        overflow: "visible", // ให้เงาทะลุออกมาได้
        bgcolor: "transparent",
        mt: 1, 
        mb: 3, 
        ml: 1 // space for shadow
      }}
    >
      {/* Main Content Box */}
      <Box sx={{ 
        bgcolor: "white", 
        borderRadius: 5, 
        overflow: "hidden",
        boxShadow: "0 10px 30px -10px rgba(255, 87, 34, 0.3)", // Colored Shadow
        transition: "transform 0.3s ease",
        "&:hover": { transform: "translateY(-5px)" }
      }}>
        
        {/* Top: Colorful Header */}
        <Box 
          sx={{ 
            height: 100, 
            background: "linear-gradient(120deg, #FF5722 0%, #FFCCBC 100%)", 
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            position: "relative"
          }}
        >
            <Chip 
              label="Limited" 
              size="small" 
              sx={{ bgcolor: "rgba(255,255,255,0.3)", color: "white", backdropFilter: "blur(4px)", fontWeight: "bold" }} 
            />
            {/* Design Circle Decoration */}
            <Box sx={{ position: "absolute", bottom: -20, right: -10, width: 80, height: 80, borderRadius: "50%", bgcolor: "rgba(255,255,255,0.2)" }} />
        </Box>

        {/* Body Content */}
        <Box sx={{ p: 2.5, pt: 1 }}>
          {/* Floating Price Tag */}
          <Box 
            sx={{ 
              mt: -4, 
              mb: 1,
              bgcolor: "white", 
              width: "fit-content", 
              px: 2, py: 0.5, 
              borderRadius: 3, 
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "baseline",
              gap: 0.5
            }}
          >
             <Typography variant="h5" fontWeight={900} color="error.main">
               {isPercent ? `${item.discountValue}%` : `฿${item.discountValue}`}
             </Typography>
             <Typography variant="caption" fontWeight={700} color="text.secondary">OFF</Typography>
          </Box>

          <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ mb: 0.5 }}>
            {item.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: "0.8rem" }}>
            เมื่อสั่งขั้นต่ำ {item.minOrderAmount?.toLocaleString()}.-
          </Typography>

          {item.promoCode && (
            <Button 
              fullWidth
              variant={copied ? "contained" : "outlined"}
              color={copied ? "success" : "error"}
              onClick={handleCopy}
              sx={{ 
                borderRadius: 3, 
                textTransform: "none", 
                borderWidth: "2px",
                fontWeight: "bold",
                "&:hover": { borderWidth: "2px" }
              }}
            >
              {copied ? "คัดลอกแล้ว!" : `Code: ${item.promoCode}`}
            </Button>
          )}
        </Box>
      </Box>
    </Card>
  );
}

// --- Main Component ---
export default function HomePromotions({ promotions }: { promotions: Content[] }) {
  if (promotions.length === 0) return null;

  return (
    <Box sx={{ mb: 5 }}>
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <LocalOfferIcon sx={{ color: "#FF5722" }} />
          <Typography variant="h6" fontWeight={800}>
             ดีลเด็ด ห้ามพลาด 🔥
          </Typography>
        </Stack>
      </Container>

      <Box 
        sx={{ 
          display: "flex", 
          gap: 1, 
          overflowX: "auto", 
          pb: 2, 
          pl: 2, // padding left for first card
          pr: 2,
          scrollBehavior: "smooth", 
          "&::-webkit-scrollbar": { display: "none" } 
        }}
      >
        {promotions.map((promo) => (
          <CouponCard key={promo.id} item={promo} />
        ))}
      </Box>
    </Box>
  );
}