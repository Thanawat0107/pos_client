import { Box, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export const Logo = () => (
  <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-1px" }}>
    <Box component={RouterLink} to="/" sx={{ textDecoration: "none", color: "inherit" }}>
      POS<Box component="span" sx={{ color: "primary.main" }}>.</Box>
    </Box>
  </Typography>
);