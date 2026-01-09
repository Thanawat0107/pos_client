/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useMemo } from "react";
import {
  Typography,
  Box,
  CircularProgress,
  Container,
  Stack,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Alert,
  Avatar,
  IconButton,
  Grid,
} from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Carousel from "../components/layouts/Carousel";
import CategoryScroller, {
  demoCategories,
} from "../components/pages/category/CategoryScroller";
import MenuScroller from "../components/pages/menu/MenuScroller";
import type { MenuItemDto } from "../@types/dto/MenuItem";
import type { Content } from "../@types/dto/Content";
import { useGetMenuItemsQuery } from "../services/menuItemApi";
import { useGetContentsQuery } from "../services/contentApi";
import { ContentType } from "../@types/Enum";

export default function Home() {
  const [cat, setCat] = useState<string>("pizza");

  // --- 1. Fetch Data (ข้อมูลจริงจาก API) ---
  const { 
    data: menuData, 
    isLoading: menuLoading, 
    isError: menuError 
  } = useGetMenuItemsQuery({
    pageNumber: 1,
    pageSize: 6,
  });

  const { 
    data: contentData, 
    isLoading: contentLoading 
  } = useGetContentsQuery({});

  // --- 2. Data Preparation ---
  const menuItems: MenuItemDto[] = menuData?.result ?? [];
  const contents: Content[] = contentData?.result ?? [];

// --- 3. Logic แยกประเภท Content (ใช้ Enum) ---
  const { promotions, news, banners } = useMemo(() => {
    const now = new Date();

    // กรองเอาเฉพาะที่ Active (isUsed = true และอยู่ในช่วงเวลา)
    const active = contents.filter((c) => {
      const start = new Date(c.startDate);
      const isNotExpired = !c.endDate || new Date(c.endDate) >= now;
      return c.isUsed && start <= now && isNotExpired;
    });

    return {
      // Banner: เอา 5 รายการแรกที่ "มีรูปเท่านั้น" (ไม่ว่า Type ไหน)
      banners: active
        .filter((c) => c.imageUrl && c.imageUrl.trim() !== "") // ✅ บังคับต้องมีรูปทุกตัว
        .slice(0, 5),

      // Coupon: เฉพาะ Promotion (เหมือนเดิม)
      promotions: active.filter((c) => c.contentType === ContentType.PROMOTION),

      // News: ข่าวสารและกิจกรรม (เหมือนเดิม)
      news: active.filter(
        (c) =>
          c.contentType === ContentType.NEWS ||
          c.contentType === ContentType.EVENT
      ),
    };
  }, [contents]);
  
  const isLoading = menuLoading || contentLoading;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress color="warning" />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 12, bgcolor: "#FAFAFA", minHeight: "100vh" }}>
      
      {/* ---------------------------------------------------
          HEADER: Greeting
      --------------------------------------------------- */}
      <Container maxWidth="xl" sx={{ pt: 2, pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" color="text.secondary">
              สวัสดีครับ, นักศึกษา/บุคลากร 👋
            </Typography>
            <Typography variant="h5" fontWeight={800} sx={{ color: "#FF5722" }}>
              หิวหรือยัง? สั่งเลย!
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <IconButton sx={{ bgcolor: "white", boxShadow: 1 }}>
              <SearchIcon />
            </IconButton>
            <IconButton sx={{ bgcolor: "white", boxShadow: 1 }}>
              <NotificationsNoneIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Container>

      {/* ---------------------------------------------------
          SECTION 1: Hero Carousel (Banners)
      --------------------------------------------------- */}
      {banners.length > 0 && (
        <Box sx={{ mb: 3, mt: 1 }}>
          <Carousel items={banners} autoPlay={true} />
        </Box>
      )}

      {/* ---------------------------------------------------
          SECTION 2: Categories
      --------------------------------------------------- */}
      <Box sx={{ mb: 3 }}>
        <Container maxWidth="xl">
          <Typography variant="subtitle1" fontWeight={700} mb={1}>
            เลือกตามหมวดหมู่
          </Typography>
        </Container>
        <CategoryScroller
          items={demoCategories}
          value={cat}
          onChange={setCat}
          maxWidth="xl"
        />
      </Box>

      {/* ---------------------------------------------------
          SECTION 3: Coupons (Promotions Only)
      --------------------------------------------------- */}
      {promotions.length > 0 && (
        <Container maxWidth="xl" sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <LocalOfferIcon color="error" />
            <Typography variant="h6" fontWeight={800}>
              ดีลเด็ดเด็กราชภัฏ 🔥
            </Typography>
          </Stack>

          {/* Horizontal Scroll */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              overflowX: "auto",
              pb: 2,
              mx: { xs: -2, sm: 0 },
              px: { xs: 2, sm: 0 },
              scrollBehavior: "smooth",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {promotions.map((promo) => (
              <CouponCard key={promo.id} item={promo} />
            ))}
          </Box>
        </Container>
      )}

      {/* ---------------------------------------------------
          SECTION 4: Menu Items (Real Data)
      --------------------------------------------------- */}
      <Container maxWidth="xl">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Box>
            <Typography variant="h5" fontWeight={800} color="text.primary">
              เมนูยอดฮิต 🍛
            </Typography>
            <Typography variant="body2" color="text.secondary">
              อร่อย ถูกใจ ชาว KRU
            </Typography>
          </Box>
          <Button size="small" color="inherit">
            ดูทั้งหมด
          </Button>
        </Stack>
      </Container>

      {menuError ? (
        <Box textAlign="center" py={4}>
          <Alert severity="error" sx={{ display: "inline-flex", borderRadius: 2 }}>
            ไม่สามารถโหลดเมนูอาหารได้
          </Alert>
        </Box>
      ) : (
        <MenuScroller
          items={menuItems}
          currency="THB"
          onAddToCart={(p) => console.log("Add:", p)}
          maxWidth="xl"
        />
      )}

      {/* ---------------------------------------------------
          SECTION 5: News & Events (Feed Style)
      --------------------------------------------------- */}
      {news.length > 0 && (
        <Container maxWidth="xl" sx={{ mt: 5 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <Box sx={{ width: 4, height: 24, bgcolor: "#FF5722", borderRadius: 1 }} />
            <Typography variant="h6" fontWeight={800}>
              ข่าวสารรอบรั้ว
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            {news.map((item) => (
              <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <NewsCard item={item} />
              </Grid>
            ))}
          </Grid>
        </Container>
      )}
    </Box>
  );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

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
        minWidth: 260,
        maxWidth: 260,
        display: "flex",
        borderRadius: 4,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        position: "relative",
        border: "none",
        overflow: "hidden",
        transition: "transform 0.2s",
        "&:hover": { transform: "translateY(-4px)" },
      }}
    >
      {/* Left: Gradient Background */}
      <Box
        sx={{
          width: 90,
          background: "linear-gradient(135deg, #FF5722 0%, #FF8A65 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 1,
          position: "relative",
        }}
      >
        <Typography variant="h5" fontWeight={900} sx={{ lineHeight: 1 }}>
          {isPercent ? `${item.discountValue}%` : `฿${item.discountValue}`}
        </Typography>
        <Typography variant="caption" fontWeight={700} sx={{ opacity: 0.9 }}>
          ส่วนลด
        </Typography>

        {/* Decorative Circles */}
        <Box sx={{ position: "absolute", top: -10, right: -10, width: 20, height: 20, borderRadius: "50%", bgcolor: "background.paper" }} />
        <Box sx={{ position: "absolute", bottom: -10, right: -10, width: 20, height: 20, borderRadius: "50%", bgcolor: "background.paper" }} />
        <Box sx={{ position: "absolute", right: 0, top: 10, bottom: 10, borderRight: "2px dashed rgba(255,255,255,0.4)" }} />
      </Box>

      {/* Right: Info */}
      <Box sx={{ flex: 1, p: 1.5, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Typography variant="subtitle2" fontWeight={800} noWrap sx={{ color: "#333" }}>
          {item.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
          ขั้นต่ำ {item.minOrderAmount?.toLocaleString()}.-
        </Typography>

        {item.promoCode && (
          <Button
            // ✅ Fix: ใช้ variant มาตรฐาน + sx style แทน 'soft as any'
            variant="text" 
            size="small"
            onClick={handleCopy}
            sx={{
              borderRadius: 50,
              py: 0.3,
              fontSize: "0.75rem",
              alignSelf: "flex-start",
              textTransform: "none",
              // Soft UI Style
              bgcolor: copied ? "success.main" : "#FFF3E0",
              color: copied ? "white" : "#E65100",
              "&:hover": { 
                  bgcolor: copied ? "success.dark" : "#FFE0B2" 
              }
            }}
          >
            {copied ? "คัดลอกแล้ว" : `ใช้โค้ด: ${item.promoCode}`}
          </Button>
        )}
      </Box>
    </Card>
  );
}

function NewsCard({ item }: { item: Content }) {
  const imageSrc = item.imageUrl || "https://placehold.co/600x400?text=News";
  // ✅ Check ContentType โดยใช้ Enum
  const isEvent = item.contentType === ContentType.EVENT;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        border: "1px solid #F0F0F0",
        transition: "all 0.3s",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia component="img" height="160" image={imageSrc} alt={item.title} />
        <Chip
          // ✅ แสดงผลตาม Enum
          label={isEvent ? "กิจกรรม" : "ข่าวสาร"}
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            height: 22,
            fontSize: 10,
            fontWeight: "bold",
            // ✅ สีตาม Enum
            bgcolor: isEvent ? "#FF9800" : "#2196F3",
            color: "white",
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} lineHeight={1.4} mb={0.5}>
          {item.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 2,
            fontSize: "0.875rem",
          }}
        >
          {item.description}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar src="/img/admin-avatar.png" sx={{ width: 20, height: 20 }} />
          <Typography variant="caption" color="text.disabled">
            {new Date(item.createdAt).toLocaleDateString("th-TH", {
              day: "numeric",
              month: "short",
            })}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}