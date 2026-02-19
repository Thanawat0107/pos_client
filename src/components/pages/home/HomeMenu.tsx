import { Box, Container, Stack, Typography, Button, Alert, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MenuScroller from "../../../components/pages/menu/MenuScroller"; 
import type { MenuItemDto } from "../../../@types/dto/MenuItem";

interface HomeMenuProps {
  items: MenuItemDto[];
  isError: boolean;
}

export default function HomeMenu({ items, isError }: HomeMenuProps) {
  const theme = useTheme();

  return (
    <Box sx={{ py: 6 }}>
      <Container maxWidth="xl">
        {/* --- Header Section (Magazine Style) --- */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "flex-end" }}
          spacing={2}
          mb={4}
        >
          <Box sx={{ position: "relative" }}>
            {/* ตกแต่งด้วยแถบสีจางๆ ด้านหลังเลข 🍛 */}
            <Typography
              variant="h3"
              fontWeight={900}
              sx={{
                color: "text.primary",
                letterSpacing: "-1px",
                lineHeight: 1,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1.5
              }}
            >
              เมนูยอดฮิต
              <Box 
                component="span" 
                sx={{ 
                  fontSize: "0.8em", 
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))" 
                }}
              >
                🍛
              </Box>
            </Typography>

            <Stack direction="row" alignItems="center" spacing={2}>
              {/* เส้นขีดตกแต่งสไตล์นิตยสาร */}
              <Box 
                sx={{ 
                  width: 40, 
                  height: 4, 
                  bgcolor: "primary.main", 
                  borderRadius: 2 
                }} 
              />
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                อร่อย ถูกใจ ชาว KRU — <Box component="span" sx={{ color: "primary.main" }}>คัดสรรมาเพื่อคุณ</Box>
              </Typography>
            </Stack>
          </Box>

          <Button
            variant="text"
            endIcon={<ArrowForwardIosIcon sx={{ fontSize: "12px !important" }} />}
            sx={{
              borderRadius: "50px",
              fontWeight: 700,
              textTransform: "none",
              color: "text.primary",
              px: 3,
              py: 1,
              backgroundColor: alpha(theme.palette.text.primary, 0.04),
              "&:hover": {
                backgroundColor: "primary.main",
                color: "white",
                transform: "translateX(5px)"
              },
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
            }}
          >
            สำรวจเมนูทั้งหมด
          </Button>
        </Stack>

        {/* --- Content Section --- */}
        {isError ? (
          <Box 
            sx={{ 
              display: "flex", 
              justifyContent: "center", 
              py: 8,
              bgcolor: alpha(theme.palette.error.main, 0.05),
              borderRadius: 4,
              border: `1px dashed ${theme.palette.error.main}`
            }}
          >
            <Alert 
              severity="error" 
              variant="outlined"
              sx={{ 
                borderRadius: 3, 
                fontWeight: 600,
                bgcolor: "background.paper"
              }}
            >
              ขออภัย! ไม่สามารถดึงข้อมูลเมนูยอดฮิตได้ในขณะนี้
            </Alert>
          </Box>
        ) : (
          <Box 
            sx={{ 
              // เพิ่มเอฟเฟกต์เงาจางๆ รอบตัว Scroller 
              mx: { xs: -2, sm: 0 },
              "& .MuiPaper-root": {
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)"
                }
              }
            }}
          >
            <MenuScroller
              items={items}
              currency="THB"
              maxWidth="xl"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}