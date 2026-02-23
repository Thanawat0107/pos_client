import { Container, Box, Stack, Grid, Divider, Button } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import type { Content } from "../../../../@types/dto/Content";
import SectionHeader from "./SectionHeader";
import HeroCard from "./HeroCard";
import SideCard from "./SideCard";
import RegularCard from "./RegularCard";
import NewsDetailModal from "./NewsDetailModal";

export default function HomeNews({ newsList }: { newsList: Content[] }) {
  const [selected, setSelected] = useState<Content | null>(null);

  if (!newsList || newsList.length === 0) return null;

  const featured = newsList[0];
  const sideItems = newsList.slice(1, 4);
  const bottomItems = newsList.slice(4, 7);

  return (
    <Box
      sx={{
        background: (theme) =>
          theme.palette.mode === "dark"
            ? `linear-gradient(180deg, transparent 0%, ${alpha(theme.palette.primary.main, 0.04)} 100%)`
            : `linear-gradient(180deg, ${alpha(theme.palette.grey[50], 0.6)} 0%, transparent 100%)`,
        py: { xs: 7, md: 10 },
      }}
    >
      <Container maxWidth="xl">
        <SectionHeader />

        {/* ─── Zone 1: Hero + Side Stack ─── */}
        <Grid container spacing={3} mb={3}>
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            <HeroCard item={featured} onClick={() => setSelected(featured)} />
          </Grid>

          <Grid size={{ xs: 12, md: 5, lg: 4 }}>
            <Stack spacing={2} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              {sideItems.map((item, i) => (
                <SideCard key={item.id} item={item} index={i} onClick={() => setSelected(item)} />
              ))}
            </Stack>
          </Grid>
        </Grid>

        {/* ─── Zone 2: Bottom Row (ถ้ามีข่าวเพิ่มตั้งแต่ชิ้นที่ 5) ─── */}
        {bottomItems.length > 0 && (
          <>
            <Divider sx={{ my: 4, opacity: 0.4 }} />
            <Grid container spacing={3}>
              {bottomItems.map((item, i) => (
                <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <RegularCard item={item} index={i} onClick={() => setSelected(item)} />
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* ─── Mobile "ดูทั้งหมด" ─── */}
        <Box sx={{ textAlign: "center", mt: 5, display: { xs: "block", sm: "none" } }}>
          <Button
            variant="outlined"
            endIcon={<ArrowForwardIcon />}
            sx={{ borderRadius: 50, fontWeight: 700, px: 4, py: 1.2, textTransform: "none" }}
          >
            ดูข่าวทั้งหมด
          </Button>
        </Box>
      </Container>

      <NewsDetailModal item={selected} onClose={() => setSelected(null)} />
    </Box>
  );
}
