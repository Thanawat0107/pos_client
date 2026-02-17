 import { Box, Grid, Skeleton, Stack, Container, Paper } from "@mui/material";

const LoadingScreen = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: { xs: 4, md: 8 } }}>
    <Container maxWidth="xl" sx={{ px: { xs: 3, md: 6 } }}>
      <Stack spacing={5}>
        
        {/* 1. Skeleton สำหรับ Header (ล้อตาม DashboardHeader) */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 5, 
            borderRadius: "32px", 
            border: '1px solid', 
            borderColor: 'divider' 
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Skeleton variant="text" width={350} height={80} sx={{ borderRadius: 2 }} />
              <Skeleton variant="text" width={250} height={30} sx={{ borderRadius: 1, mt: 1 }} />
            </Box>
            <Stack direction="row" spacing={2}>
              <Skeleton variant="rounded" width={60} height={60} sx={{ borderRadius: '20px' }} />
              <Skeleton variant="rounded" width={180} height={60} sx={{ borderRadius: '20px' }} />
            </Stack>
          </Stack>
        </Paper>

        {/* 2. Skeleton สำหรับ KPI Cards (4 ใบ) */}
        <Grid container spacing={5}>
          {[1, 2, 3, 4].map((i) => (
            <Grid size={{xs: 12, sm: 6, lg: 3}} key={i}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 5, 
                  borderRadius: "32px", 
                  height: 240, 
                  border: '1px solid', 
                  borderColor: 'divider' 
                }}
              >
                <Stack spacing={3}>
                  <Stack direction="row" justifyContent="space-between">
                    <Skeleton variant="rounded" width={72} height={72} sx={{ borderRadius: '20px' }} />
                    <Skeleton variant="rounded" width={80} height={36} sx={{ borderRadius: '12px' }} />
                  </Stack>
                  <Box>
                    <Skeleton variant="text" width="60%" height={25} />
                    <Skeleton variant="text" width="90%" height={60} />
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* 3. Skeleton สำหรับ Main Content (8/4) */}
        <Grid container spacing={5}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 5, 
                height: 500, 
                borderRadius: "32px", 
                border: '1px solid', 
                borderColor: 'divider' 
              }}
            >
              <Stack spacing={3}>
                <Skeleton variant="text" width={300} height={40} />
                <Skeleton variant="rounded" height={350} sx={{ borderRadius: '24px' }} />
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 5, 
                height: 500, 
                borderRadius: "32px", 
                border: '1px solid', 
                borderColor: 'divider' 
              }}
            >
              <Stack spacing={3}>
                <Skeleton variant="text" width="70%" height={40} />
                <Stack spacing={2}>
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} variant="rounded" height={80} sx={{ borderRadius: '16px' }} />
                  ))}
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* 4. Skeleton สำหรับตารางด้านล่าง */}
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: "32px", 
            border: '1px solid', 
            borderColor: 'divider',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 5, borderBottom: '1px solid', borderColor: 'divider' }}>
             <Skeleton variant="text" width={400} height={50} />
          </Box>
          <Box sx={{ p: 5 }}>
            <Skeleton variant="rounded" height={400} sx={{ borderRadius: '20px' }} />
          </Box>
        </Paper>

      </Stack>
    </Container>
  </Box>
);

export default LoadingScreen;