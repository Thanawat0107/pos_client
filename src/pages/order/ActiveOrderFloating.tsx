/* eslint-disable @typescript-eslint/no-unused-vars */
 import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box, Paper, Typography, Fade, keyframes,
  Badge, Menu, MenuItem, ListItemText, ListItemIcon, Divider
} from "@mui/material";

// Icons
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useGetOrderHistoryQuery } from "../../services/orderApi";
import { Sd } from "../../helpers/SD";
import { useAppSelector } from "../../hooks/useAppHookState";
import { SD_Roles } from "../../@types/Enum";

// Animation for "Ready" status
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(46, 125, 50, 0); }
  100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0); }
`;

export default function ActiveOrderFloating() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth);

  // 1. 🌀 ประกาศ Hooks ทั้งหมดไว้ด้านบน (ห้ามมี return ก่อนหน้ากลุ่มนี้)
  const [guestTokens, setGuestTokens] = useState<string[]>(() => {
    const saved = localStorage.getItem("guestTokens");
    try {
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch { return []; }
  });

  useEffect(() => {
    const updateTokens = () => {
      const saved = localStorage.getItem("guestTokens");
      try {
        setGuestTokens(saved ? JSON.parse(saved) : []);
      } catch (e) { console.error(e); }
    };
    window.addEventListener("activeOrderUpdated", updateTokens);
    return () => window.removeEventListener("activeOrderUpdated", updateTokens);
  }, []);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const { data: apiOrders = [] } = useGetOrderHistoryQuery(
    { 
      userId: user?.userId, 
      guestToken: guestTokens.join(',') 
    },
    { 
      skip: !user?.userId && guestTokens.length === 0,
      pollingInterval: 15000 
    }
  );

  const activeOrders = useMemo(() => {
    if (!apiOrders) return [];
    return apiOrders
      .filter((o) => o.orderStatus !== Sd.Status_Cancelled && o.orderStatus !== Sd.Status_Completed)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || Date.now()).getTime();
        const dateB = new Date(b.createdAt || Date.now()).getTime();
        return dateB - dateA;
      });
  }, [apiOrders]);

  // -------------------------------------------------------------
  // 2. 🔥 ย้าย Hiding Logic มาไว้ตรงนี้ (หลังประกาศ Hooks ทั้งหมด)
  // -------------------------------------------------------------
  const isHiddenPage =
    location.pathname.toLowerCase().includes("order-success") ||
    location.pathname.toLowerCase().includes("checkout") ||
    location.pathname.toLowerCase().includes("my-orders") ||
    location.pathname.toLowerCase().includes("login");

  // ✅ เช็คเงื่อนไขทั้งหมดรวมกันที่นี่ที่เดียว
  if (
    user?.role === SD_Roles.Admin || 
    user?.role === SD_Roles.Employee || 
    activeOrders.length === 0 || 
    isHiddenPage
  ) {
    return null;
  }

  // -------------------------------------------------------------
  // 5. UI Helpers
  // -------------------------------------------------------------
  const getStatusInfo = (status: string) => {
    switch (status) {
      case Sd.Status_PendingPayment:
        return {
          color: "#E65100",
          label: "รอชำระเงิน",
          icon: <QrCodeScannerIcon fontSize="small" />,
        };
      case Sd.Status_Paid:
        return {
          color: "#1565C0",
          label: "รอคิว",
          icon: <PendingActionsIcon fontSize="small" />,
        };
      case Sd.Status_Preparing:
        return {
          color: "#7B1FA2",
          label: "กำลังปรุง",
          icon: <RestaurantIcon fontSize="small" />,
        };
      case Sd.Status_Ready:
        return {
          color: "#2E7D32",
          label: "เสร็จแล้ว!",
          icon: <CheckCircleIcon fontSize="small" />,
        };
      default:
        return {
          color: "grey",
          label: "ดำเนินการ",
          icon: <StorefrontIcon fontSize="small" />,
        };
    }
  };

  const isMultiple = activeOrders.length > 1;
  const latestOrder = activeOrders[0];
  const statusConfig = getStatusInfo(latestOrder.orderStatus);
  const isAnyReady = activeOrders.some(o => o.orderStatus === Sd.Status_Ready);

  const handleClickBar = (event: React.MouseEvent<HTMLElement>) => {
    if (isMultiple) {
      setAnchorEl(event.currentTarget);
    } else {
      navigate(`/order-success/${activeOrders[0].id}`);
    }
  };

  const handleCloseMenu = () => setAnchorEl(null);

  const handleSelectOrder = (orderId: number) => {
    handleCloseMenu();
    navigate(`/order-success/${orderId}`);
  };

  return (
    <>
      <Fade in={true}>
        <Paper
          onClick={handleClickBar}
          elevation={10}
          sx={{
            position: "fixed",
            zIndex: 1300,
            bottom: { xs: 20, md: 24 },
            right: { xs: 20, md: 24 },
            left: { xs: 20, md: "auto" },
            maxWidth: { xs: "95%", md: "380px" },
            minWidth: { md: "320px" },
            borderRadius: 4,
            p: 2,
            cursor: "pointer",
            bgcolor: isMultiple ? "#263238" : statusConfig.color, // สีเข้มขึ้นเมื่อมีหลายรายการ
            color: "white",
            display: "flex",
            alignItems: "center",
            animation: isAnyReady ? `${pulse} 2s infinite` : "none",
            transition: "all 0.3s ease-in-out",
            "&:hover": { transform: "translateY(-4px)", filter: "brightness(1.1)" }
          }}
        >
          {/* Icon Circle */}
          <Box sx={{ bgcolor: "rgba(255,255,255,0.2)", borderRadius: "50%", p: 1, mr: 2, display: "flex" }}>
            {isMultiple ? (
              <Badge badgeContent={activeOrders.length} color="error">
                <ReceiptLongIcon fontSize="small" />
              </Badge>
            ) : (
              statusConfig.icon
            )}
          </Box>

          {/* Text Content */}
          <Box sx={{ flexGrow: 1, mr: 1 }}>
            {isMultiple ? (
              <>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>ติดตามสถานะออเดอร์</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                      {activeOrders.length} รายการ
                    </Typography>
                    {/* Status Dots Indicators */}
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {activeOrders.map((o) => (
                            <Box 
                                key={o.id}
                                sx={{ 
                                    width: 8, height: 8, borderRadius: '50%', 
                                    bgcolor: getStatusInfo(o.orderStatus).color,
                                    border: '1px solid white'
                                }} 
                            />
                        ))}
                    </Box>
                </Box>
              </>
            ) : (
              <>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>ออเดอร์ #{latestOrder.pickUpCode || latestOrder.id}</Typography>
                <Typography variant="subtitle1" fontWeight={800}>{statusConfig.label}</Typography>
              </>
            )}
          </Box>

          <ArrowForwardIosIcon sx={{ fontSize: 14, opacity: 0.7 }} />
        </Paper>
      </Fade>

      {/* Multiple Orders Menu */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        PaperProps={{ 
            elevation: 8, 
            sx: { width: 320, maxHeight: 450, borderRadius: 3, mt: -1, p: 0, overflow: 'hidden' } 
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Typography variant="subtitle1" fontWeight="bold">รายการที่กำลังดำเนินการ</Typography>
          <Typography variant="caption" color="text.secondary">เลือกรายการเพื่อดูรายละเอียด</Typography>
        </Box>
        <Divider />
        <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
            {activeOrders.map((order) => {
            const conf = getStatusInfo(order.orderStatus);
            return (
                <MenuItem key={order.id} onClick={() => handleSelectOrder(order.id)} sx={{ py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                <ListItemIcon sx={{ color: conf.color }}>{conf.icon}</ListItemIcon>
                <ListItemText
                    primary={`ออเดอร์ #${order.pickUpCode || order.id}`}
                    secondary={conf.label}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                    secondaryTypographyProps={{ color: conf.color, fontWeight: 700, fontSize: '0.8rem' }}
                />
                <ArrowForwardIosIcon sx={{ fontSize: 12, color: 'grey.400' }} />
                </MenuItem>
            );
            })}
        </Box>
      </Menu>
    </>
  );
}