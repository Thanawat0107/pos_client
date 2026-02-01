import { Box, Container, Typography, Card, CardContent, Chip, Button, Stack, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useGetOrderHistoryQuery } from "../../services/orderApi";
import { Sd } from "../../helpers/SD";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useAppSelector } from "../../hooks/useAppHookState";
import { useEffect } from "react";

export default function MyOrders() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth);
  const userId = user?.userId || undefined; 
  const guestToken = localStorage.getItem("cartToken") || "";

  useEffect(() => {
    console.log("🔍 [MyOrders] Checking Identity:", {
      reduxUser: user,
      resolvedUserId: userId,
      storageToken: guestToken,
    });
  }, [user, userId, guestToken]);

  const {
    data: orders = [],
    isLoading,
    isError,
    error,
  } = useGetOrderHistoryQuery(
    {
      // ส่งไปเฉพาะที่มีค่า (ถ้า userId ไม่มี ให้ส่ง undefined/null)
      userId: userId,
      guestToken: guestToken,
    },
    {
      // ถ้าไม่มีทั้งคู่ -> ไม่ต้องยิง (Skip)
      skip: !userId && !guestToken,
      // (Optional) ถ้าอยากให้ชัวร์ว่าข้อมูลสดใหม่เสมอ
      refetchOnMountOrArgChange: true,
    },
  );

  // Debug ผลลัพธ์ API
  useEffect(() => {
    if (isLoading) console.log("⏳ Loading Orders...");
    if (orders.length > 0) console.log("✅ Orders Loaded:", orders);
    if (orders.length === 0 && !isLoading)
      console.log("⚠️ No Orders Found (Empty Array)");
    if (isError) console.error("❌ API Error:", error);
  }, [orders, isLoading, isError, error]);

  if (isLoading)
    return (
      <Box p={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", py: 4 }}>
      <Container maxWidth="sm">
        <Typography variant="h5" fontWeight={800} mb={3}>
          รายการคำสั่งซื้อของฉัน
        </Typography>

        {orders && orders.length > 0 ? (
          <Stack spacing={2}>
            {orders.map((order) => (
              <Card
                key={order.id}
                sx={{ borderRadius: 3, cursor: "pointer" }}
                onClick={() => navigate(`/order-success/${order.id}`)}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      #{order.pickUpCode || order.orderCode.slice(-5)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(order.createdAt).toLocaleString("th-TH")}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="primary"
                      mt={1}
                    >
                      {order.orderDetails.length} รายการ • ฿
                      {order.total.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Chip
                      label={order.orderStatus}
                      color={
                        order.orderStatus === Sd.Status_Ready
                          ? "success"
                          : "default"
                      }
                      size="small"
                      sx={{ mb: 1, fontWeight: 700 }}
                    />
                    <NavigateNextIcon color="action" />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <Typography textAlign="center" color="text.secondary">
            ไม่มีรายการคำสั่งซื้อ
          </Typography>
        )}

        <Button
          fullWidth
          variant="outlined"
          sx={{ mt: 4 }}
          onClick={() => navigate("/")}
        >
          กลับหน้าหลัก
        </Button>
      </Container>
    </Box>
  );
}