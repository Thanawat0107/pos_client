import {
  Box,
  Container,
  Divider,
  Grid,
  IconButton,
  Link,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import GitHubIcon from "@mui/icons-material/GitHub";

type LinkItem = { label: string; href: string };
type Section = { title: string; links: LinkItem[] };

const sections: Section[] = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "#" },
      { label: "Features", href: "#" },
      { label: "Solutions", href: "#" },
      { label: "Tutorials", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "News", href: "#" },
    ],
  },
  {
    title: "Resource",
    links: [
      { label: "Blog", href: "#" },
      { label: "Newsletter", href: "#" },
      { label: "Events", href: "#" },
      { label: "Help center", href: "#" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <Box
      component="footer"
      sx={{
        borderTop: (t) => `1px solid ${t.palette.divider}`,
        bgcolor: (t) =>
          t.palette.mode === "dark" ? t.palette.background.default : "#fafafa",
        width: "100%",
        mt: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 10 } }}>
        {/* Top area */}
        {/** มือถือ: Brand + Accordions / เดสก์ท็อป: Grid ปกติ */}
        {isSmUp ? (
          <Grid container spacing={4} alignItems="flex-start">
            {/* Brand / About */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={1}>
                <Typography variant="h5" fontWeight={800}>
                  POS
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ maxWidth: 420 }}
                >
                  ร้านก๋วยเตี๋ยวแชมป์ บริเวณหน้ามหาวิทยาลัยราชภัฏกาญจนบุรี
                </Typography>
              </Stack>
            </Grid>

            {/* Sections */}
            {sections.map((sec) => (
              <Grid key={sec.title} size={{ xs: 6, md: 2 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 1.5, fontWeight: 800, letterSpacing: 0.2 }}
                >
                  {sec.title}
                </Typography>
                <Stack component="nav" spacing={1}>
                  {sec.links.map((l) => (
                    <Link
                      key={l.label}
                      href={l.href}
                      underline="none"
                      color="text.primary"
                      sx={{
                        "&:hover": { color: "primary.main" },
                        transition: "color .15s",
                        fontSize: 14,
                      }}
                    >
                      {l.label}
                    </Link>
                  ))}
                </Stack>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Stack spacing={3}>
            {/* Brand บนมือถือ: ตัวหนังสือกะทัดรัด */}
            <Stack spacing={0.75}>
              <Typography variant="h6" fontWeight={800}>
                POS
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ร้านอาหารขนาดเล็กตั้งอยู่ที่หน้ามหาวิทยาลัยราชภัฏกาญจนบุรี
              </Typography>
            </Stack>

            {/* Sections แบบ Accordion (พับ/กางได้) */}
            <Stack>
              {sections.map((sec, idx) => (
                <Accordion
                  key={sec.title}
                  disableGutters
                  elevation={0}
                  square
                  sx={{
                    "&::before": { display: "none" },
                    borderTop: idx === 0 ? "1px solid" : "none",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: "transparent",
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      px: 0,
                      "& .MuiAccordionSummary-content": { my: 0.5 },
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={800}
                      color="text.secondary"
                    >
                      {sec.title}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 0, pt: 0, pb: 1.25 }}>
                    <Stack component="nav" spacing={1}>
                      {sec.links.map((l) => (
                        <Link
                          key={l.label}
                          href={l.href}
                          underline="none"
                          color="text.primary"
                          sx={{
                            py: 0.25,
                            "&:active": { opacity: 0.8 },
                            fontSize: 14,
                          }}
                        >
                          {l.label}
                        </Link>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Stack>
        )}

        <Divider sx={{ my: { xs: 4, md: 6 } }} />

        {/* Bottom bar */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Typography variant="body2" color="text.secondary">
            © {year} Dev. by Mr. Thanawat Butseree & Asst. Prof. Teeradet
            Tavarpinun
          </Typography>

          <Stack direction="row" spacing={1}>
            {[
              { icon: <FacebookIcon />, label: "Facebook", href: "#" },
              { icon: <InstagramIcon />, label: "Instagram", href: "#" },
              { icon: <GitHubIcon />, label: "GitHub", href: "#" },
            ].map((s, i) => (
              <IconButton
                key={i}
                aria-label={s.label}
                component="a"
                href={s.href}
                size="small"
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  "&:hover": { bgcolor: "action.hover" },
                  width: 40, // ✅ hit-area ใหญ่ กดง่ายบนมือถือ
                  height: 40,
                }}
              >
                {s.icon}
              </IconButton>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
