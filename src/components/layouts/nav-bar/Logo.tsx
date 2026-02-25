import { Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ROOT_PATH } from "../../../helpers/SD";

const path = "http://tee.kru.ac.th/cs66/s07/cnmswep/";
// const path = "/";

export const Logo = () => (
  <Box
    component={RouterLink}
    to={ROOT_PATH}
    sx={{
      textDecoration: "none",
      color: "inherit",
      display: "flex",
      alignItems: "center",
      gap: 1.5,
    }}
  >
    <Box
      component="img"
      src={`${path}logo/logo.png`}
      alt="POS Logo"
      sx={{
        height: { xs: 64, sm: 84, md: 104 },
        maxWidth: { xs: 200, sm: 260, md: 320 },
        width: "auto",
        objectFit: "contain",
        display: "block",
        filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))",
      }}
    />
  </Box>
);