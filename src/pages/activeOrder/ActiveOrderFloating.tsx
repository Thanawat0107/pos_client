 import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGetOrderHistoryQuery } from "../../services/orderApi";
import { Sd } from "../../helpers/SD";
import { useAppSelector } from "../../hooks/useAppHookState";
import { SD_Roles } from "../../@types/Enum";
import FloatingButton from "./FloatingButton";
import OrderMenu from "./OrderMenu";

export default function ActiveOrderFloating() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth);

  // --- State & Logic ---
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

  // --- Hiding Logic ---
  const isHiddenPage =
    location.pathname.toLowerCase().includes("order-success") ||
    location.pathname.toLowerCase().includes("checkout") ||
    location.pathname.toLowerCase().includes("my-orders") ||
    location.pathname.toLowerCase().includes("login");

  if (
    user?.role === SD_Roles.Admin ||
    user?.role === SD_Roles.Employee ||
    activeOrders.length === 0 ||
    isHiddenPage
  ) {
    return null;
  }

  // --- Handlers ---
  const handleClickBar = (event: React.MouseEvent<HTMLElement>) => {
    if (activeOrders.length > 1) {
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
      <FloatingButton 
        activeOrders={activeOrders} 
        onClick={handleClickBar} 
      />
      
      <OrderMenu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        activeOrders={activeOrders}
        onSelect={handleSelectOrder}
      />
    </>
  );
}