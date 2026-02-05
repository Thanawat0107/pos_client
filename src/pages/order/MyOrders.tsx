 import { useEffect, useMemo } from "react";
import { 
  Box, Container, Typography, Card, CardContent, Chip, Button, Stack, CircularProgress 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { useGetOrderHistoryQuery } from "../../services/orderApi";
import { Sd } from "../../helpers/SD";
import { useAppSelector } from "../../hooks/useAppHookState";

export default function MyOrders() {
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth?.userId);

  // -------------------------------------------------------------
  // 1. Security Guard: ถ้าไม่ใช่สมาชิก ให้ดีดออกทันที
  // -------------------------------------------------------------
  useEffect(() => {
    if (!userId) {
      // ถ้าไม่มี User ID ให้กลับไปหน้า Login หรือหน้าแรก
      navigate("/login"); 
    }
  }, [userId, navigate]);

  // -------------------------------------------------------------
  // 2. ดึงข้อมูลสมาชิก (API Member)
  //    * Real-time จะทำงานอัตโนมัติผ่าน onCacheEntryAdded ใน orderApi ที่เราทำไว้
  // -------------------------------------------------------------
  const { 
    data: apiOrders = [], 
    isLoading, 
    // isError, refetch ก็ใช้ได้ถ้าต้องการปุ่ม Refresh
  } = useGetOrderHistoryQuery(
    { userId }, 
    { 
      skip: !userId, // ถ้าไม่มี User ไม่ต้องยิง (กัน Error)
      refetchOnMountOrArgChange: true 
    }
  );

  // -------------------------------------------------------------
  // 3. จัดเตรียมข้อมูล (Sorting & Mapping)
  // -------------------------------------------------------------
  const orders = useMemo(() => {
    if (!apiOrders) return [];
    
    // Copy array เพื่อ Sort (ป้องกัน Mutation error)
    return [...apiOrders]
      .map(o => ({
        ...o,
        // Map field ให้ชัวร์ (เผื่อ Backend ส่งมาไม่ครบ)
        orderStatus: o.orderStatus || o.orderStatus,
        createdAt: o.createdAt || new Date().toISOString(),
        total: o.total || o.orderTotal || 0,
        orderDetails: o.orderDetails || []
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [apiOrders]);

  // -------------------------------------------------------------
  // Helper: สีของ Status Chip
  // -------------------------------------------------------------
  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case Sd.Status_PendingPayment: return "warning";
      case Sd.Status_Paid: return "info";
      case Sd.Status_Preparing: return "secondary";
      case Sd.Status_Ready: return "success";
      case Sd.Status_Completed: return "default";
      case Sd.Status_Cancelled: return "error";
      default: return "default";
    }
  };

  // -------------------------------------------------------------
  // Render
  // -------------------------------------------------------------

  // ถ้ากำลัง Redirect หรือไม่มี User ไม่ต้อง Render อะไร (ป้องกันหน้าจอกระพริบ)
  if (!userId) return null;

  if (isLoading) {
    return (
      <Box p={4} display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", py: 4 }}>
      <Container maxWidth="sm">
        <Typography variant="h5" fontWeight={800} mb={3}>
          รายการคำสั่งซื้อของฉัน
        </Typography>

        {orders.length > 0 ? (
          <Stack spacing={2}>
            {orders.map((order) => (
              <Card
                key={order.id}
                sx={{ 
                  borderRadius: 3, 
                  cursor: "pointer", 
                  transition: '0.2s', 
                  '&:hover': { transform: 'scale(1.01)', boxShadow: 4 } 
                }}
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
                      {/* แสดงเลข Order Code หรือ Pickup Code */}
                      #{order.pickUpCode || (order.orderCode ? order.orderCode.slice(-5) : '...')}
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
                      {order.orderDetails?.length || 0} รายการ • ฿
                      {order.total?.toLocaleString() || "0"}
                    </Typography>
                  </Box>
                  
                  <Box textAlign="right">
                    <Chip
                      label={order.orderStatus}
                      color={getStatusColor(order.orderStatus)}
                      size="small"
                      variant={order.orderStatus === Sd.Status_Ready ? "filled" : "outlined"}
                      sx={{ mb: 1, fontWeight: 700 }}
                    />
                    <Box display="flex" justifyContent="flex-end">
                       <NavigateNextIcon color="action" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <Box textAlign="center" py={5} sx={{ opacity: 0.7 }}>
            <Typography variant="h6" color="text.secondary" mb={1}>
              ไม่มีรายการคำสั่งซื้อ
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              คุณยังไม่ได้สั่งอาหารเลย สั่งสักหน่อยไหม?
            </Typography>
            <Button variant="contained" onClick={() => navigate("/")}>
                ไปหน้าเมนู
            </Button>
          </Box>
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