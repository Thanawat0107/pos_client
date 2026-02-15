import { Box, CircularProgress, Typography, Stack } from "@mui/material";

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "80vh",
        width: "100%",
      }}
    >
      <Stack spacing={2} alignItems="center">
        <CircularProgress
          size={40}
          thickness={4}
          sx={{ color: "primary.main" }}
        />
        <Typography variant="body1" color="text.secondary" fontWeight="medium">
          กำลังโหลดข้อมูลแดชบอร์ด...
        </Typography>
      </Stack>
    </Box>
  );
};

export default LoadingScreen;
