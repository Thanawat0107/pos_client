 import React, { useRef } from "react";
import { Box, Paper, Typography, Fade, Badge, useTheme, useMediaQuery } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import Draggable, { type DraggableEventHandler } from 'react-draggable';
import { Sd } from "../../helpers/SD";
import { getStatusConfig } from "../../utility/OrderHelpers"; 
import { pulseGreen } from "../../utility/utils"; 
import type { OrderHeader } from "../../@types/dto/OrderHeader";

interface Props {
  activeOrders: OrderHeader[];
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

export default function FloatingButton({ activeOrders, onClick }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const nodeRef = useRef(null);
  const paperRef = useRef<HTMLDivElement>(null); 
  const startPosRef = useRef({ x: 0, y: 0 });

  const isMultiple = activeOrders.length > 1;
  const latestOrder = activeOrders[0];
  const statusConfig = getStatusConfig(latestOrder.orderStatus);
  const isAnyReady = activeOrders.some(o => o.orderStatus === Sd.Status_Ready);

  const handleStart: DraggableEventHandler = (e, data) => {
    startPosRef.current = { x: data.x, y: data.y };
  };

  const handleStop: DraggableEventHandler = (e, data) => {
    const distance = Math.sqrt(
      Math.pow(data.x - startPosRef.current.x, 2) + 
      Math.pow(data.y - startPosRef.current.y, 2)
    );

    if (distance < 5) {
      const fakeEvent = {
        ...e,
        currentTarget: paperRef.current, 
        target: paperRef.current,
      } as unknown as React.MouseEvent<HTMLElement>;

      onClick(fakeEvent); 
    }
  };

  return (
    <Draggable
      nodeRef={nodeRef}
      onStart={handleStart}
      onStop={handleStop}
      bounds="body" // ✅ เพิ่มบรรทัดนี้: ล็อคขอบเขตให้อยู่แค่ในหน้าจอ (Body)
    >
      <Box
        ref={nodeRef}
        sx={{
          position: "fixed",
          zIndex: 1300,
          bottom: { xs: 80, md: 24 }, 
          right: { xs: 20, md: 24 },
          cursor: "move", 
          touchAction: "none" 
        }}
      >
        <Fade in={true}>
          <Paper
            ref={paperRef} 
            elevation={10}
            sx={{
              bgcolor: isMultiple ? "#263238" : statusConfig.iconColor,
              color: "white",
              display: "flex",
              alignItems: "center",
              animation: isAnyReady ? `${pulseGreen} 2s infinite` : "none",
              transition: "transform 0.1s ease-out, filter 0.3s", 
              "&:hover": { filter: "brightness(1.1)" },
              borderRadius: isMobile ? "50%" : 10,
              width: isMobile ? 64 : "auto",
              height: isMobile ? 64 : "auto",
              minWidth: isMobile ? "unset" : "320px",
              maxWidth: isMobile ? "64px" : "380px",
              p: isMobile ? 0 : 2,
              justifyContent: isMobile ? "center" : "flex-start",
            }}
          >
            {/* ... (เนื้อหาข้างในเหมือนเดิม) ... */}
            
            {isMobile ? (
               <Box sx={{ position: 'relative', display: 'flex' }}>
                 <Badge badgeContent={activeOrders.length} color="error" sx={{ '& .MuiBadge-badge': { fontWeight: 700 } }}>
                   <ReceiptLongIcon />
                 </Badge>
                 <Box sx={{ position: 'absolute', top: -12, left: -12, right: -12, bottom: -12, borderRadius: '50%', border: '2px solid transparent', background: isMultiple ? `conic-gradient(${activeOrders.map((o, i) => `${getStatusConfig(o.orderStatus).iconColor} ${(i/activeOrders.length)*360}deg ${((i+1)/activeOrders.length)*360}deg`).join(', ')})` : 'transparent', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'exclude' }} />
               </Box>
             ) : (
               <>
                 <Box sx={{ bgcolor: "rgba(255,255,255,0.2)", borderRadius: "50%", p: 1.2, mr: 2, display: "flex" }}>
                    {isMultiple ? <Badge badgeContent={activeOrders.length} color="error"><ReceiptLongIcon fontSize="small" sx={{ color: '#fff' }} /></Badge> : <Box sx={{ color: '#fff' }}>{statusConfig.icon || <ReceiptLongIcon />}</Box>}
                 </Box>
                 <Box sx={{ flexGrow: 1, mr: 1, overflow: 'hidden' }}>
                    <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>{isMultiple ? "ติดตามสถานะออเดอร์" : (latestOrder.pickUpCode ? `คิวรับอาหาร: ${latestOrder.pickUpCode}` : `Order #${latestOrder.orderCode}`)}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                       <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2 }}>{isMultiple ? `${activeOrders.length} รายการ` : statusConfig.label}</Typography>
                       {isMultiple && <Box sx={{ display: 'flex', gap: 0.5 }}>{activeOrders.map((o) => <Box key={o.id} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: getStatusConfig(o.orderStatus).iconColor, border: '1.5px solid white' }} />)}</Box>}
                    </Box>
                 </Box>
                 <ArrowForwardIosIcon sx={{ fontSize: 16, opacity: 0.8 }} />
               </>
             )}

          </Paper>
        </Fade>
      </Box>
    </Draggable>
  );
}