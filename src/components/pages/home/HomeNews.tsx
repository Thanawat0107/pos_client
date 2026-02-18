/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Container,
  Stack,
  Box,
  Typography,
  Card,
  CardMedia,
  Grid,
  Button,
  useTheme,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { alpha } from "@mui/material/styles";
import { ContentType } from "../../../@types/Enum";
import type { Content } from "../../../@types/dto/Content";
import { baseUrl } from "../../../helpers/SD";

// --- ชิ้นข่าวปกติ (Standard Card) ---
// function NewsCard({ item }: { item: Content }) {
//   const rawImage = item.imageUrl || "https://placehold.co/600x400?text=News";
//   const displayImage = rawImage.startsWith("http") ? rawImage : baseUrl + rawImage;
//   const isEvent = item.contentType === ContentType.EVENT;

//   return (
//     <Card
//       elevation={0}
//       sx={{
//         height: "100%",
//         display: "flex",
//         flexDirection: "column",
//         borderRadius: 5,
//         bgcolor: "background.paper",
//         transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
//         border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.08)}`,
//         "&:hover": {
//           transform: "translateY(-8px)",
//           boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
//           "& img": { transform: "scale(1.1)" },
//         },
//       }}
//     >
//       <Box sx={{ position: "relative", borderRadius: 5, overflow: "hidden", height: 200 }}>
//         <CardMedia
//           component="img"
//           image={displayImage}
//           alt={item.title}
//           sx={{ height: "100%", transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}
//         />
//         <TypeTag isEvent={isEvent} />
//       </Box>

//       <CardContent sx={{ p: 3 }}>
//         <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
//           {new Date(item.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "long" })}
//         </Typography>
//         <Typography variant="h6" sx={{ fontWeight: 800, mt: 1, mb: 1, lineHeight: 1.3, fontSize: "1.1rem" }}>
//           {item.title}
//         </Typography>
//         <Typography variant="body2" color="text.secondary" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
//           {item.description}
//         </Typography>
//       </CardContent>
//     </Card>
//   );
// }

// --- ชิ้นข่าวเด่น (Featured Card) ---
function FeaturedNewsCard({ item }: { item: Content }) {
  const rawImage = item.imageUrl || "https://placehold.co/1200x800?text=Featured";
  const displayImage = rawImage.startsWith("http") ? rawImage : baseUrl + rawImage;
  const isEvent = item.contentType === ContentType.EVENT;

  return (
    <Card
      elevation={0}
      sx={{
        height: { xs: 350, md: "100%" },
        position: "relative",
        borderRadius: 6,
        overflow: "hidden",
        "&:hover img": { transform: "scale(1.05)" },
      }}
    >
      <CardMedia
        component="img"
        image={displayImage}
        sx={{ height: "100%", width: "100%", objectFit: "cover", transition: "transform 0.8s" }}
      />
      {/* Overlay Gradient */}
      <Box sx={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
      }} />

      <Box sx={{ position: "absolute", bottom: 0, left: 0, p: { xs: 3, md: 5 }, color: "white" }}>
        <TypeTag isEvent={isEvent} />
        <Typography variant="caption" sx={{ display: "block", mt: 2, opacity: 0.8, fontWeight: 600 }}>
          ข่าวเด่นประจำสัปดาห์ • {new Date(item.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "long" })}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 900, mt: 1, textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
          {item.title}
        </Typography>
        <Button variant="contained" sx={{ mt: 2, borderRadius: 50, textTransform: "none", px: 3 }}>
          อ่านรายละเอียด
        </Button>
      </Box>
    </Card>
  );
}

// --- Shared Components ---
const TypeTag = ({ isEvent }: { isEvent: boolean }) => (
  <Box sx={{
    position: "absolute", top: 20, left: 20,
    bgcolor: isEvent ? alpha("#FF9800", 0.9) : alpha("#2196F3", 0.9),
    color: "white", px: 2, py: 0.5, borderRadius: "50px",
    fontSize: "0.75rem", fontWeight: 800, backdropFilter: "blur(8px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 1
  }}>
    {isEvent ? "EVENT" : "NEWS"}
  </Box>
);

export default function HomeNews({ newsList }: { newsList: Content[] }) {
  const theme = useTheme();
  if (!newsList || newsList.length === 0) return null;

  // แยกข่าวเด่น (ชิ้นแรก) ออกมา
  const featuredNews = newsList[0];
  const otherNews = newsList.slice(1, 4); // เอาข่าวที่เหลืออีก 3 ชิ้น

  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      {/* Header สไตล์ Magazine */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-end"
        mb={5}
      >
        <Box>
          <Typography variant="h3" fontWeight={900} letterSpacing="-1px">
            อัปเดต{" "}
            <Box component="span" sx={{ color: "primary.main" }}>
              ข่าวสาร
            </Box>
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            fontWeight={500}
            sx={{ mt: 1 }}
          >
            ไม่พลาดทุกกิจกรรมและโปรโมชั่นพิเศษจากเรา
          </Typography>
        </Box>
        <Button
          endIcon={<ArrowForwardIcon />}
          sx={{
            borderRadius: 50,
            fontWeight: 700,
            px: 3,
            py: 1,
            bgcolor: alpha(theme.palette.text.primary, 0.05),
            color: "text.primary",
          }}
        >
          ดูข่าวทั้งหมด
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {/* Bento Layout: ฝั่งซ้ายข่าวเด่น (ใหญ่) */}
        {/* ใช้ size แทนการเขียน xs, md, lg แยกกัน และลบ item ออก */}
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <FeaturedNewsCard item={featuredNews} />
        </Grid>

        {/* ฝั่งขวาข่าวรอง (เล็ก) */}
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <Stack spacing={3} sx={{ height: "100%" }}>
            {otherNews.map((item) => (
              <Box key={item.id} sx={{ flex: 1 }}>
                <SmallNewsCard item={item} />
              </Box>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}

// --- ชิ้นข่าวแบบ Row (สำหรับวางฝั่งขวา) ---
function SmallNewsCard({ item }: { item: Content }) {
  const rawImage = item.imageUrl || "https://placehold.co/200x200?text=News";
  const displayImage = rawImage.startsWith("http") ? rawImage : baseUrl + rawImage;

  return (
    <Stack 
      direction="row" 
      spacing={2} 
      component={Card} 
      elevation={0}
      sx={{ 
        p: 1.5, borderRadius: 4, height: "100%", transition: "0.3s",
        border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        "&:hover": { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02), transform: "scale(1.02)" }
      }}
    >
      <Box sx={{ width: 100, height: 100, borderRadius: 3, overflow: "hidden", flexShrink: 0 }}>
        <img src={displayImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </Box>
      <Box sx={{ py: 0.5 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
           {new Date(item.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2, mt: 0.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.title}
        </Typography>
      </Box>
    </Stack>
  );
}