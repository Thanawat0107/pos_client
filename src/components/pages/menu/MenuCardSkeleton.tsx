import { Skeleton, Stack, Box } from "@mui/material";

export default function MenuCardSkeleton() {
  return (
    <Box sx={{ width: 280, p: 2 }}>
      {/* ส่วนของรูปภาพอาหาร */}
      <Skeleton variant="rectangular" width="100%" height={180} sx={{ borderRadius: 4 }} />
      
      <Stack spacing={1} sx={{ mt: 2 }}>
        {/* ส่วนของชื่อเมนู */}
        <Skeleton variant="text" width="80%" height={30} />
        
        {/* ส่วนของรายละเอียดเมนู */}
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="60%" />
        
        {/* ส่วนของราคาและปุ่ม */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
          <Skeleton variant="rounded" width={60} height={30} />
          <Skeleton variant="circular" width={40} height={40} />
        </Stack>
      </Stack>
    </Box>
  );
}