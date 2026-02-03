/* eslint-disable @typescript-eslint/no-explicit-any */
import { Menu, MenuItem, ListItemText, ListItemIcon, Box, Typography, Divider } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { getStatusInfo } from "../../helpers/utils";

interface Props {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  activeOrders: any[];
  onSelect: (orderId: number) => void;
}

export default function OrderMenu({ anchorEl, open, onClose, activeOrders, onSelect }: Props) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
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
        {activeOrders.map((order: any) => {
          const conf = getStatusInfo(order.orderStatus);
          return (
            <MenuItem key={order.id} onClick={() => onSelect(order.id)} sx={{ py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
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
  );
}