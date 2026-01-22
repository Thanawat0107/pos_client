import { useState } from "react";
import { Container, Stack, Typography, Box, Card, Button, Chip, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import type { Content } from "../../../@types/dto/Content";

function CouponCard({ item }: { item: Content }) {
  const theme = useTheme();
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
    <Box sx={{ 
      flex: "0 0 auto", 
      py: 2, // เผื่อพื้นที่ให้เงาด้านบน/ล่าง
      px: 1.5 
    }}>
      <Card 
        elevation={0}
        sx={{ 
          width: 280, 
          borderRadius: 6, 
          position: "relative",
          overflow: "visible",
          bgcolor: "background.paper",
          // ใช้เงาสีส้มจางๆ ตามธีมอาหาร
          boxShadow: `0 15px 35px ${alpha(theme.palette.primary.main, 0.15)}`,
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          "&:hover": { 
            transform: "translateY(-8px) scale(1.02)",
            boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.25)}`,
          }
        }}
      >
        {/* --- ส่วนบน: Ticket Header --- */}
        <Box sx={{ 
          height: 90, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #FF8A65 100%)`, 
          p: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          // ทำรอยปรุวงกลมด้านข้าง (Ticket Notch)
          "&::before, &::after": {
            content: '""',
            position: "absolute",
            bottom: -10,
            width: 20,
            height: 20,
            borderRadius: "50%",
            bgcolor: "background.default", // สีเดียวกับพื้นหลังหน้าเว็บ
            zIndex: 2
          },
          "&::before": { left: -10 },
          "&::after": { right: -10 }
        }}>
          <Chip 
            label="คูปองพิเศษ" 
            size="small" 
            sx={{ 
              width: "fit-content",
              bgcolor: "rgba(255,255,255,0.2)", 
              color: "white", 
              backdropFilter: "blur(8px)", 
              fontWeight: 700,
              fontSize: "0.65rem",
              mb: 0.5
            }} 
          />
          <Typography variant="h4" fontWeight={900} color="white" sx={{ lineHeight: 1 }}>
            {isPercent ? `${item.discountValue}%` : `฿${item.discountValue}`}
            <Typography component="span" variant="button" sx={{ ml: 1, opacity: 0.8 }}>OFF</Typography>
          </Typography>
        </Box>

        {/* --- ส่วนล่าง: Ticket Details --- */}
        <Box sx={{ p: 2.5, pt: 3 }}>
          <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ mb: 0.5, letterSpacing: "-0.5px" }}>
            {item.title}
          </Typography>
          
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2, fontWeight: 500 }}>
             ช้อปขั้นต่ำ ฿{item.minOrderAmount?.toLocaleString()}
          </Typography>

          {item.promoCode && (
            <Button 
              fullWidth
              variant={copied ? "contained" : "outlined"}
              color={copied ? "success" : "primary"}
              onClick={handleCopy}
              startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
              sx={{ 
                borderRadius: "12px", 
                textTransform: "none", 
                fontWeight: 700,
                py: 1,
                borderWidth: "2px",
                "&:hover": { borderWidth: "2px" },
                // เอฟเฟกต์สีเวลาคัดลอกสำเร็จ
                transition: "all 0.2s"
              }}
            >
              {copied ? "คัดลอกแล้ว" : item.promoCode}
            </Button>
          )}
        </Box>

        {/* เส้นประรอยตัดคูปอง */}
        <Box sx={{
          position: "absolute",
          top: 90,
          left: 15,
          right: 15,
          borderBottom: `2px dashed ${alpha(theme.palette.divider, 0.1)}`,
          zIndex: 1
        }} />
      </Card>
    </Box>
  );
}

export default function HomePromotions({ promotions }: { promotions: Content[] }) {
  if (!promotions?.length) return null;

  return (
    <Box sx={{ py: 4, overflow: "hidden" }}>
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
          <Box sx={{ 
            display: 'flex', 
            p: 1, 
            borderRadius: 2, 
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1) 
          }}>
            <LocalOfferIcon color="primary" />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: "-0.5px" }}>
              ดีลเด็ด ห้ามพลาด
            </Typography>
            <Typography variant="body2" color="text.secondary">
              คูปองส่วนลดพิเศษสำหรับวันนี้เท่านั้น
            </Typography>
          </Box>
        </Stack>
      </Container>

      {/* Scrolling Container: ปรับแต่งให้เงามีพื้นที่แสดงผล */}
      <Box 
        sx={{ 
          display: "flex", 
          gap: 0.5, 
          overflowX: "auto", 
          px: { xs: 2, md: 5 }, // ให้เริ่มเลื่อนจากขอบ Container พอดี
          pb: 4, 
          cursor: "grab",
          "&:active": { cursor: "grabbing" },
          scrollBehavior: "smooth", 
          "&::-webkit-scrollbar": { display: "none" },
          // ป้องกัน Shadow โดนตัดที่ขอบซ้ายขวา
          "&::after": { content: '""', paddingRight: "20px" } 
        }}
      >
        {promotions.map((promo) => (
          <CouponCard key={promo.id} item={promo} />
        ))}
      </Box>
    </Box>
  );
}