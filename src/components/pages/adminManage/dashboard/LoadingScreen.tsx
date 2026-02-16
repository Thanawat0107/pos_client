import { Box, Grid, Skeleton, Stack, Container } from "@mui/material";

const LoadingScreen = () => (
  <Container maxWidth="xl" sx={{ py: 4 }}>
    <Stack spacing={4}>
      {/* Skeleton สำหรับ Header */}
      <Box>
        <Skeleton variant="text" width={300} height={60} />
        <Skeleton variant="text" width={200} height={30} />
      </Box>

      {/* Skeleton สำหรับ KPI Cards */}
      <Grid container spacing={4}>
        {[1, 2, 3, 4].map((i) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={i}>
            <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>

      {/* Skeleton สำหรับ Main Content */}
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Skeleton variant="rounded" height={450} sx={{ borderRadius: 4 }} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Skeleton variant="rounded" height={450} sx={{ borderRadius: 4 }} />
        </Grid>
      </Grid>
    </Stack>
  </Container>
);

export default LoadingScreen;