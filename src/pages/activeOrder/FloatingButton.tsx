/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box, Paper, Typography, Fade, Badge } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Sd } from "../../helpers/SD";
import { getStatusInfo, pulse } from "../../helpers/utils";

interface Props {
  activeOrders: any[];
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

export default function FloatingButton({ activeOrders, onClick }: Props) {
  const isMultiple = activeOrders.length > 1;
  const latestOrder = activeOrders[0];
  const statusConfig = getStatusInfo(latestOrder.orderStatus);
  const isAnyReady = activeOrders.some(o => o.orderStatus === Sd.Status_Ready);

  return (
    <Fade in={true}>
      <Paper
        onClick={onClick}
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
          bgcolor: isMultiple ? "#263238" : statusConfig.color,
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
                  {activeOrders.map((o: any) => (
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
              <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                ออเดอร์ #{latestOrder.pickUpCode || latestOrder.id}
              </Typography>
              <Typography variant="subtitle1" fontWeight={800}>{statusConfig.label}</Typography>
            </>
          )}
        </Box>

        <ArrowForwardIosIcon sx={{ fontSize: 14, opacity: 0.7 }} />
      </Paper>
    </Fade>
  );
}