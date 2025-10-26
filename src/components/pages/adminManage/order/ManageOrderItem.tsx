import * as React from "react";
import {
  Chip, IconButton, Stack, Tooltip, Typography,
  TableRow, TableCell, Menu, MenuItem
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PrintIcon from "@mui/icons-material/Print";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import RefundOutlinedIcon from "@mui/icons-material/PointOfSale"; // ใช้แทน Refund
import type { OrderRow, OrderStatus, PayStatus, Channel } from "./ManageOrderList";

function fmtTHB(n: number) {
  return n.toLocaleString("th-TH", { style: "currency", currency: "THB" });
}

const statusColor: Record<OrderStatus, "default" | "primary" | "success" | "warning" | "error"> = {
  PENDING: "warning",
  COOKING: "primary",
  READY: "success",
  COMPLETED: "default",
  CANCELLED: "error",
};

const payColor: Record<PayStatus, "default" | "success" | "warning" | "error"> = {
  UNPAID: "warning",
  PAID: "success",
  REFUNDED: "error",
};

const channelLabel: Record<Channel, string> = {
  DINE_IN: "ทานที่ร้าน", TAKEAWAY: "กลับบ้าน", DELIVERY: "เดลิเวอรี่",
};

type Props = {
  row: OrderRow;
  onChangeStatus: (id: string, next: OrderStatus) => void;
  onViewDetail: (row: OrderRow) => void;
  onPrint: (id: string) => void;
  onRefund: (id: string) => void;
};

export default function ManageOrderItem({
  row, onChangeStatus, onViewDetail, onPrint, onRefund,
}: Props) {
  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchor);

  return (
    <TableRow hover sx={{ opacity: row.status === "CANCELLED" ? 0.6 : 1 }}>
      <TableCell>
        <Stack spacing={0.25}>
          <Typography fontWeight={800}>{row.code}</Typography>
          <Typography variant="body2" color="text.secondary">{row.orderedAt}</Typography>
        </Stack>
      </TableCell>

      <TableCell>
        <Stack spacing={0.25}>
          <Typography fontWeight={700}>{row.customerName ?? "-"}</Typography>
          <Typography variant="body2" color="text.secondary">{row.phone ?? "-"}</Typography>
        </Stack>
      </TableCell>

      <TableCell align="center">{row.itemsCount}</TableCell>

      <TableCell>
        <Chip label={channelLabel[row.channel]} size="small" variant="outlined" />
      </TableCell>

      <TableCell align="right">
        <Stack alignItems="flex-end">
          <Typography fontWeight={800}>{fmtTHB(row.total)}</Typography>
          <Typography variant="body2" color="text.secondary">สุทธิ (รวมส่วนลด/ค่าจัดส่ง)</Typography>
        </Stack>
      </TableCell>

      <TableCell>
        <Chip
          label={row.status}
          color={statusColor[row.status]}
          size="small"
          sx={{ textTransform: "capitalize" }}
        />
      </TableCell>

      <TableCell>
        <Chip
          label={row.paymentStatus}
          color={payColor[row.paymentStatus]}
          size="small"
          sx={{ textTransform: "capitalize" }}
        />
      </TableCell>

      <TableCell align="right">
        <Tooltip title="รายละเอียด">
          <IconButton size="small" onClick={() => onViewDetail(row)}>
            <VisibilityOutlinedIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="พิมพ์ใบเสร็จ">
          <IconButton size="small" onClick={() => onPrint(row.id)}>
            <PrintIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="เพิ่มเติม">
          <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
        </Tooltip>

        <Menu
          open={open}
          anchorEl={anchor}
          onClose={() => setAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          {(["PENDING","COOKING","READY","COMPLETED","CANCELLED"] as OrderStatus[]).map((s) => (
            <MenuItem
              key={s}
              selected={row.status === s}
              onClick={() => { onChangeStatus(row.id, s); setAnchor(null); }}
            >
              เปลี่ยนสถานะ → {s}
            </MenuItem>
          ))}
          <MenuItem
            onClick={() => { onRefund(row.id); setAnchor(null); }}
            disabled={row.paymentStatus !== "PAID"}
          >
            <RefundOutlinedIcon sx={{ mr: 1 }} fontSize="small" />
            คืนเงิน
          </MenuItem>
        </Menu>
      </TableCell>
    </TableRow>
  );
}
