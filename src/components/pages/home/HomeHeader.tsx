import { Box, Typography, Stack, IconButton, Container, Avatar, Paper } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

export default function HomeHeader() {
  return (
    <Container maxWidth="xl" sx={{ pt: 3, pb: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        
        {/* Left: Greeting & Avatar */}
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar 
            src="/img/user-placeholder.png" 
            sx={{ width: 48, height: 48, border: "2px solid white", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
          />
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              ยินดีต้อนรับ, 👋
            </Typography>
            <Typography variant="h6" fontWeight={800} lineHeight={1.1}>
              คุณลูกค้า
            </Typography>
          </Box>
        </Stack>

        {/* Right: Notification */}
        <IconButton 
          sx={{ 
            bgcolor: "background.paper", 
            boxShadow: "0 4px 14px rgba(0,0,0,0.08)", 
            color: "#FF5722",
            "&:hover": { bgcolor: "action.hover" }
          }}
        >
          <NotificationsNoneIcon />
        </IconButton>
      </Stack>

      {/* Modern Search Bar (Fake Input) */}
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: 1.5,
          pl: 2.5,
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          bgcolor: "rgba(255,255,255,0.8)", // Glass effect layout
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
          border: "1px solid rgba(255,255,255,0.5)",
          cursor: "pointer",
          transition: "transform 0.2s",
          "&:active": { transform: "scale(0.98)" }
        }}
      >
        <SearchIcon sx={{ color: "#FF5722", mr: 1.5 }} />
        <Typography color="text.disabled" variant="body2" fontWeight={500}>
          ค้นหาเมนูโปรด, ร้านอาหาร...
        </Typography>
      </Paper>
    </Container>
  );
}