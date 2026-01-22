import { Box, CircularProgress, Fade } from "@mui/material";
import Carousel from "../../components/layouts/Carousel";
import { useHomeData } from "./useHomeData";
import HomeHeader from "../../components/pages/home/HomeHeader";
import HomePromotions from "../../components/pages/home/HomePromotions";
import HomeMenu from "../../components/pages/home/HomeMenu";
import HomeNews from "../../components/pages/home/HomeNews";

export default function Home() {
  const { menuItems, banners, promotions, news, isLoading, menuError } = useHomeData();

  // if (isLoading) return <LoadingScreen />; // แยก Loading ออกไปเพื่อความสะอาด

  return (
    <Fade in timeout={800}>
      <Box sx={{ 
        minHeight: "100vh",
        bgcolor: "background.default",
        // สร้าง gradient อ่อนๆ จากบนลงล่างให้ดูละมุน
        background: (theme) => theme.palette.mode === 'light' 
          ? "linear-gradient(180deg, #FFEDE5 0%, #FFFFFF 40%)" 
          : "linear-gradient(180deg, #1A0A05 0%, #0F0F0F 100%)"
      }}>
        
        {/* Header Section */}
        <Box sx={{ pt: { xs: 2, md: 4 } }}>
          <HomeHeader />
        </Box>

        {/* Hero Section: Carousel */}
        {banners.length > 0 && (
          <Box sx={{ 
            mt: { xs: 0, md: 2 }, 
            px: { xs: 0, md: 6 }, // บน Desktop ให้เว้นข้างเพื่อให้ Carousel ดูลอยๆ
            maxWidth: "1600px",
            mx: "auto"
          }}>
            <Carousel items={banners} />
          </Box>
        )}

        {/* เนื้อหาส่วนถัดไป */}
        <Box sx={{ mt: 8 }}>
          <HomePromotions promotions={promotions} />
          
          <Box sx={{ position: 'relative', zIndex: 2, mt: 4 }}>
             <HomeMenu items={menuItems} isError={menuError} />
          </Box>

          <HomeNews newsList={news} />
        </Box>
        
      </Box>
    </Fade>
  );
}