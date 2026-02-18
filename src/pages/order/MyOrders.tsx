/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Stack,
  CircularProgress,
  Avatar,
  AvatarGroup,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { motion } from "framer-motion";

import { useGetOrderHistoryQuery } from "../../services/orderApi";
import { Sd } from "../../helpers/SD";
import { useAppSelector } from "../../hooks/useAppHookState";

export default function MyOrders() {
  const theme = useTheme();
  const navigate = useNavigate();
  const userId = useAppSelector((state) => state.auth?.userId);
  const guestToken = localStorage.getItem("guestToken") || "";

  useEffect(() => {
    if (!userId) navigate("/login");
  }, [userId, navigate]);

  const { data: apiOrders = [], isLoading } = useGetOrderHistoryQuery(
    { userId, guestToken },
    { skip: !userId, refetchOnMountOrArgChange: true },
  );

  const orders = useMemo(() => {
    if (!apiOrders) return [];
    return [...apiOrders].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [apiOrders]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case Sd.Status_PendingPayment:
        return { color: "warning", label: "รอชำระเงิน" };
      case Sd.Status_Paid:
        return { color: "info", label: "ชำระเงินแล้ว" };
      case Sd.Status_Preparing:
        return { color: "secondary", label: "กำลังปรุง" };
      case Sd.Status_Ready:
        return { color: "success", label: "พร้อมรับอาหาร" };
      case Sd.Status_Completed:
        return { color: "default", label: "เสร็จสิ้น" };
      case Sd.Status_Cancelled:
        return { color: "error", label: "ยกเลิก" };
      default:
        return { color: "default", label: status };
    }
  };

  if (!userId) return null;

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress
          thickness={5}
          size={60}
          sx={{ color: theme.palette.primary.main }}
        />
        <Typography mt={2} color="text.secondary" fontWeight={600}>
          กำลังโหลดประวัติความอร่อย...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFA", py: { xs: 4, sm: 6 } }}>
      <Container maxWidth="sm">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={{ xs: 1.5, sm: 2 }}
            mb={{ xs: 3, sm: 5 }}
          >
            <Box
              sx={{
                p: { xs: 1, sm: 1.5 },
                bgcolor: "primary.main",
                borderRadius: 3,
                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <ReceiptLongIcon
                sx={{ color: "#fff", fontSize: { xs: 24, sm: 32 } }}
              />
            </Box>
            <Box>
              <Typography
                variant="h4"
                fontWeight={900}
                sx={{
                  letterSpacing: -0.5,
                  fontSize: { xs: "1.5rem", sm: "2.125rem" },
                }}
              >
                ออเดอร์ของฉัน
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={600}
              >
                ทั้งหมด {orders.length} รายการ
              </Typography>
            </Box>
          </Stack>
        </motion.div>

        {orders.length > 0 ? (
          <Stack spacing={{ xs: 2, sm: 3 }}>
            {orders.map((order, index) => {
              const status = getStatusStyles(order.orderStatus);
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    elevation={0}
                    onClick={() => navigate(`/order-success/${order.id}`)}
                    sx={{
                      borderRadius: { xs: 4, sm: 5 },
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: alpha(theme.palette.divider, 0.1),
                      background: "#fff",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                      {/* Top Row */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={{ xs: 2, sm: 3 }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight={900}
                          color="primary"
                          sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
                        >
                          #{order.pickUpCode || order.orderCode?.slice(-5)}
                        </Typography>
                        <Chip
                          label={status.label}
                          color={status.color as any}
                          size="small"
                          sx={{
                            fontWeight: 900,
                            fontSize: "0.75rem",
                            px: 0.5,
                            borderRadius: 1.5,
                          }}
                        />
                      </Stack>

                      {/* Middle Row */}
                      <Stack
                        direction="row"
                        spacing={{ xs: 2, sm: 3 }}
                        alignItems="center"
                        mb={{ xs: 2, sm: 3 }}
                      >
                        <AvatarGroup
                          max={3}
                          sx={{
                            "& .MuiAvatar-root": {
                              width: { xs: 40, sm: 50 },
                              height: { xs: 40, sm: 50 },
                              border: "2px solid #fff",
                            },
                          }}
                        >
                          {order.orderDetails?.map((item: any, i: number) => (
                            <Avatar key={i} src={item.menuItemImage} />
                          ))}
                        </AvatarGroup>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="h4"
                            fontWeight={900}
                            sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
                          >
                            ฿{order.total?.toLocaleString()}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={700}
                          >
                            {order.orderDetails?.length || 0} รายการ
                          </Typography>
                        </Box>
                      </Stack>

                      <Divider
                        sx={{ my: { xs: 1.5, sm: 2.5 }, opacity: 0.6 }}
                      />

                      {/* Bottom Row */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                          color="text.secondary"
                        >
                          <AccessTimeIcon sx={{ fontSize: 14 }} />
                          <Typography variant="caption" fontWeight={700}>
                            {new Date(order.createdAt).toLocaleDateString(
                              "th-TH",
                              { day: "numeric", month: "short" },
                            )}{" "}
                            •{" "}
                            {new Date(order.createdAt).toLocaleTimeString(
                              "th-TH",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </Typography>
                        </Stack>

                        <Button
                          variant="text"
                          size="small"
                          endIcon={<NavigateNextIcon />}
                          sx={{ fontWeight: 900, p: 0 }}
                        >
                          เพิ่มเติม
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </Stack>
        ) : (
          <Box
            textAlign="center"
            py={{ xs: 6, sm: 12 }}
            sx={{
              bgcolor: alpha("#fff", 0.5),
              borderRadius: 10,
              border: "3px dashed #E0E0E0",
            }}
          >
            <FastfoodIcon
              sx={{
                fontSize: { xs: 60, sm: 100 },
                color: alpha(theme.palette.text.disabled, 0.2),
                mb: 3,
              }}
            />
            <Typography
              variant="h6"
              fontWeight={900}
              color="text.secondary"
              mb={1}
            >
              ยังไม่มีประวัติการสั่งซื้อ
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/")}
              sx={{ mt: 2, px: 4, borderRadius: 3, fontWeight: 900 }}
            >
              ไปที่หน้าเมนู
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
