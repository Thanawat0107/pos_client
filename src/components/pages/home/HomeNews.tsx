import {
  Container,
  Stack,
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Button
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { ContentType } from "../../../@types/Enum";
import type { Content } from "../../../@types/dto/Content";
import { baseUrl } from "../../../helpers/SD";

function NewsCard({ item }: { item: Content }) {
  // 1. Logic การเลือกรูป: ถ้ามีรูปให้ใช้รูป ถ้าไม่มีใช้ Placeholder
  // และเช็คว่าเป็น HTTP อยู่แล้วหรือไม่ (เพื่อกัน baseUrl ต่อซ้ำ)
  const rawImage = item.imageUrl || "https://placehold.co/600x400?text=News";
  const displayImage = rawImage.startsWith("http") ? rawImage : baseUrl + rawImage;

  const isEvent = item.contentType === ContentType.EVENT;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        bgcolor: "transparent",
        transition: "transform 0.3s",
        "&:hover": {
           transform: "translateY(-4px)",
           "& .img-container": { boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }
        },
      }}
    >
      {/* Image with Tag */}
      <Box className="img-container" sx={{ position: "relative", borderRadius: 4, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", transition: "box-shadow 0.3s" }}>
        <CardMedia 
          component="img" 
          height="180" 
          // 2. ใช้ตัวแปรที่ผ่านการเช็ค URL แล้ว
          image={displayImage} 
          alt={item.title} 
          sx={{ objectFit: "cover" }} 
          // 3. เพิ่ม onError กันเหนียว
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "https://placehold.co/600x400?text=No+Image";
          }}
        />
        
        {/* ... (ส่วน Label EVENT/NEWS เหมือนเดิม) ... */}
        <Box 
          sx={{ 
            position: "absolute", 
            top: 12, left: 12, 
            bgcolor: isEvent ? "rgba(255, 152, 0, 0.9)" : "rgba(33, 150, 243, 0.9)",
            color: "white",
            px: 1.5, py: 0.5,
            borderRadius: 2,
            fontSize: "0.7rem",
            fontWeight: "bold",
            backdropFilter: "blur(4px)"
          }}
        >
          {isEvent ? "EVENT" : "NEWS"}
        </Box>
      </Box>

      {/* ... (ส่วนเนื้อหา CardContent เหมือนเดิม ไม่ต้องแก้) ... */}
      <CardContent sx={{ px: 1, py: 2, flexGrow: 1 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
           {new Date(item.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "long" })}
        </Typography>
        
        <Typography variant="h6" fontWeight={800} lineHeight={1.3} mb={1} sx={{ fontSize: "1rem" }}>
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
            fontSize: "0.85rem",
          }}
        >
          {item.description}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function HomeNews({ newsList }: { newsList: Content[] }) {
  if (!newsList || newsList.length === 0) return null;

  return (
    <Container maxWidth="xl" sx={{ mt: 6, mb: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{ width: 4, height: 28, bgcolor: "#333", borderRadius: 1 }} />
          <Typography variant="h5" fontWeight={800} color="#333">
            ข่าวสาร & กิจกรรม
          </Typography>
        </Stack>
        <Button endIcon={<ArrowForwardIcon />} color="inherit" sx={{ borderRadius: 50, px: 2 }}>
           ดูทั้งหมด
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {newsList.map((item) => (
          <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <NewsCard item={item} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}