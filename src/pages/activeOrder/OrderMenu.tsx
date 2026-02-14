import {
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { getStatusConfig } from "../../utility/OrderHelpers";
import type { OrderHeader } from "../../@types/dto/OrderHeader";
import { Sd } from "../../helpers/SD";

// 1. เพิ่มชุดสถานะที่จะซ่อนเลขคิว (ให้เหมือน OrderStatusCard)
const HIDDEN_QUEUE_STATUSES = [
  Sd.Status_Pending,
  Sd.Status_PendingPayment,
  Sd.Status_Cancelled,
];

interface Props {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  activeOrders: OrderHeader[];
  onSelect: (orderId: number) => void;
}

export default function OrderMenu({
  anchorEl,
  open,
  onClose,
  activeOrders,
  onSelect,
}: Props) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        elevation: 8,
        sx: {
          // ✅ Responsive Width:
          // Mobile (xs): กว้างเกือบเต็มจอ (ลบขอบซ้ายขวาหน่อย)
          // Desktop (md): กว้าง 320px เท่าเดิม
          width: { xs: "calc(100vw - 48px)", md: 320 },

          // ✅ Responsive Height:
          // Mobile: สูงไม่เกิน 70% ของจอ (กันบัง Header)
          // Desktop: สูงไม่เกิน 450px
          maxHeight: { xs: "70vh", md: 450 },

          borderRadius: 4,
          mt: -1.5,
          overflow: "hidden",
        },
      }}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      transformOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Box sx={{ p: 2, bgcolor: "#fafafa", borderBottom: "1px solid #eee" }}>
        <Typography variant="subtitle1" fontWeight={800} color="text.primary">
          รายการที่กำลังดำเนินการ
        </Typography>
        <Typography variant="caption" color="text.secondary">
          เลือกรายการเพื่อดูรายละเอียด
        </Typography>
      </Box>

      <Box sx={{ maxHeight: { xs: "60vh", md: 350 }, overflowY: "auto" }}>
        {activeOrders.map((order) => {
          const config = getStatusConfig(order.orderStatus);
          
          // 2. เช็ก showQueue รายตัวใน Loop
          const showQueue = !HIDDEN_QUEUE_STATUSES.includes(order.orderStatus);
          
          const timeString = new Date(order.createdAt).toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <MenuItem
              key={order.id}
              onClick={() => onSelect(order.id)}
              sx={{
                py: 2,
                borderBottom: "1px solid #f0f0f0",
                transition: "all 0.2s",
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
            >
              <ListItemIcon sx={{ color: config.iconColor, minWidth: 40 }}>
                {config.icon}
              </ListItemIcon>

              <ListItemText
                // ✅ แก้ Hydration Error: บอกให้ secondary เรนเดอร์เป็น div (เพราะข้างในมี Chip/Box)
                secondaryTypographyProps={{ component: "div" }}
                primary={
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography fontWeight={700} fontSize="0.95rem">
                      {showQueue && order.pickUpCode // ✅ ใช้ logic เดียวกับ Card
                        ? `คิวที่: ${order.pickUpCode}`
                        : `Order #${order.orderCode || order.id}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {timeString} น.
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mt: 0.5,
                      gap: 1,
                    }}
                  >
                    <Chip
                      label={config.label}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        bgcolor: config.bg,
                        color: config.text,
                        border: `1px solid ${config.iconColor}40`,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {order.orderDetails?.length || 0} รายการ
                    </Typography>
                  </Box>
                }
              />

              <ArrowForwardIosIcon
                sx={{ fontSize: 14, color: "grey.400", ml: 1 }}
              />
            </MenuItem>
          );
        })}
      </Box>
    </Menu>
  );
}
