import {
  Box,
  Container,
  Divider,
  Grid,
  IconButton,
  Link,
  Stack,
  Typography,
} from "@mui/material";
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

  return (
    <Box
      component="footer"
      sx={{
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: (theme) =>
          theme.palette.mode === "dark"
            ? theme.palette.background.default
            : "#fafafa",
        width: "100%",
        mt: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 },  }}>
        <Grid container spacing={4} alignItems="flex-start">
          {/* Brand / About */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={1}>
              <Typography variant="h5" fontWeight={700}>
                POS
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 360 }}
              >
                ร้านอาการขนาดเล็กตั้งอยู่ที่หน้ามหสาวิทยาลัยราชภัฏกาญจนบุรี
              </Typography>
            </Stack>
          </Grid>

          {/* Sections */}
          {sections.map((sec) => (
            <Grid key={sec.title} size={{ xs: 6, sm: 4, md: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1.5, fontWeight: 700, letterSpacing: 0.2 }}
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

        <Divider sx={{ my: { xs: 4, md: 6 } }} />

        {/* Bottom bar */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Typography variant="body2" color="text.secondary">
            © {year} Dev. by Mr.Thanawat Butseree and Asst. Prof.Teeradet
            Tavarpinun
          </Typography>

          <Stack direction="row" spacing={1}>
            {[
              { icon: <FacebookIcon />, label: "Facebook" },
              { icon: <InstagramIcon />, label: "Instagram" },
              { icon: <GitHubIcon />, label: "GitHub" },
            ].map((s, i) => (
              <IconButton
                key={i}
                aria-label={s.label}
                size="small"
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
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
