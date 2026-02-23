import { Stack, Box, Typography, Button } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { alpha, useTheme } from "@mui/material/styles";

export default function SectionHeader() {
  const theme = useTheme();

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={5}>
      <Box>
        {/* Label line */}
        <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
          <Box sx={{ width: 28, height: 4, borderRadius: 2, bgcolor: "primary.main" }} />
          <Typography
            variant="overline"
            sx={{ color: "primary.main", fontWeight: 800, letterSpacing: 2.5, lineHeight: 1 }}
          >
            NEWS & EVENTS
          </Typography>
        </Stack>

        <Typography variant="h3" fontWeight={900} letterSpacing="-1.5px" lineHeight={1.1}>
          อัปเดต{" "}
          <Box
            component="span"
            sx={{
              color: "transparent",
              backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, ${
                theme.palette.secondary?.main ?? theme.palette.primary.light
              })`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
            }}
          >
            ข่าวสาร
          </Box>
        </Typography>

        <Typography variant="body1" color="text.secondary" fontWeight={500} sx={{ mt: 1 }}>
          ไม่พลาดทุกกิจกรรมและโปรโมชั่นพิเศษจากเรา
        </Typography>
      </Box>

      <Button
        endIcon={<ArrowForwardIcon />}
        sx={{
          borderRadius: 50, fontWeight: 700, px: 3, py: 1.2,
          bgcolor: alpha(theme.palette.text.primary, 0.05),
          color: "text.primary", textTransform: "none",
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          transition: "all 0.2s",
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            borderColor: alpha(theme.palette.primary.main, 0.3),
          },
          display: { xs: "none", sm: "inline-flex" },
        }}
      >
        ดูข่าวทั้งหมด
      </Button>
    </Stack>
  );
}
