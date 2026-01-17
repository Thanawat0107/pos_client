import { Box, CircularProgress, Fade } from "@mui/material";
import Carousel from "../../components/layouts/Carousel";
import { useHomeData } from "./useHomeData";
import HomeHeader from "../../components/pages/home/HomeHeader";
import HomePromotions from "../../components/pages/home/HomePromotions";
import HomeMenu from "../../components/pages/home/HomeMenu";
import HomeNews from "../../components/pages/home/HomeNews";

export default function Home() {
  const { 
    menuItems, banners, promotions, news, 
    isLoading, menuError 
  } = useHomeData();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress thickness={5} size={60} sx={{ color: "#FF5722" }} />
      </Box>
    );
  }

  return (
    <Fade in={!isLoading} timeout={800}>
      <Box 
        sx={{ 
          pb: 12, 
          minHeight: "100vh",
          // Background Gradient: สีส้มอ่อนไล่ลงมาขาว ให้ความรู้สึกอบอุ่นและ "เช้าวันใหม่"
          background: "linear-gradient(180deg, #FFF3E0 0%, #FAFAFA 30%, #FFFFFF 100%)"
        }}
      >
        
        {/* Header */}
        <HomeHeader />

        {/* Banners: เพิ่มเงาฟุ้งๆ ด้านหลัง */}
        {banners.length > 0 && (
          <Box sx={{ mb: 4, mt: 2, position: "relative", zIndex: 1 }}>
             <Carousel items={banners} autoPlay={true} />
          </Box>
        )}

        {/* Categories */}
        {/* <Box sx={{ mb: 4 }}>
          <Container maxWidth="xl">
            <Typography variant="h6" fontWeight={800} mb={2} sx={{ opacity: 0.9 }}>
              อยากทานอะไรดี? 🍕
            </Typography>
          </Container>
          <CategoryScroller
            items={demoCategories}
            value={cat}
            onChange={setCat}
            maxWidth="xl"
          />
        </Box> */}

        {/* Promotions: Section เด่น */}
        <HomePromotions promotions={promotions} />

        {/* Menu Items */}
        <Box sx={{ position: 'relative', zIndex: 2 }}>
           <HomeMenu items={menuItems} isError={menuError} />
        </Box>

        {/* News */}
        <HomeNews newsList={news} />
        
      </Box>
    </Fade>
  );
}