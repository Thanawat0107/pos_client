import * as React from "react";
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  TableRow,
  TableCell,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PrintIcon from "@mui/icons-material/Print";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import type {
  OrderRow,
  OrderStatus,
  PayStatus,
  Channel,
} from "./ManageOrderList";

const statusColor: Record<
  OrderStatus,
  "default" | "primary" | "success" | "warning" | "error"
> = {
  PENDING: "warning",
  COOKING: "primary",
  READY: "success",
  COMPLETED: "default",
  CANCELLED: "error",
};
const payColor: Record<PayStatus, "default" | "success" | "warning" | "error"> =
  {
    UNPAID: "warning",
    PAID: "success",
    REFUNDED: "error",
  };
const channelLabel: Record<Channel, string> = {
  DINE_IN: "ทานที่ร้าน",
  TAKEAWAY: "กลับบ้าน",
  DELIVERY: "เดลิเวอรี่",
};

// จำกัด transition ที่สมเหตุสมผล
const allowed: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["COOKING", "CANCELLED"],
  COOKING: ["READY", "CANCELLED"],
  READY: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

type Props = {
  row: OrderRow;
  index?: number; // << ใหม่
  refundingId?: string | null;
  onChangeStatus: (id: string, next: OrderStatus) => void;
  onViewDetail: (row: OrderRow) => void;
  onPrint: (id: string) => void;
  onRefund: (id: string) => void;
};

export default function ManageOrderItem({
  row,
  index,
  refundingId,
  onChangeStatus,
  onViewDetail,
  onPrint,
  onRefund,
}: Props) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchor);

  // ===== 📱 Mobile: Card =====
  if (!isMdUp) {
    return (
      <Card
        variant="outlined"
        sx={{ borderRadius: 2, opacity: row.status === "CANCELLED" ? 0.6 : 1 }}
      >
        <CardContent sx={{ p: 1.5 }}>
          <Stack spacing={0.75}>
            {/* แถวบน: โค้ด + สถานะ + ลำดับ */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={1}
            >
              <Typography fontWeight={800}>{row.code}</Typography>
              <Stack direction="row" spacing={0.5} alignItems="center">
                {typeof index === "number" && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`ลำดับ ${index}`}
                  />
                )}
                <Chip
                  size="small"
                  label={row.status}
                  color={statusColor[row.status]}
                  sx={{ textTransform: "capitalize" }}
                />
              </Stack>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {row.orderedAt}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              alignItems="center"
            >
              <Chip
                size="small"
                variant="outlined"
                label={channelLabel[row.channel]}
              />
              <Chip
                size="small"
                color={payColor[row.paymentStatus]}
                label={row.paymentStatus}
                sx={{ textTransform: "capitalize" }}
              />
              <Typography fontWeight={800} sx={{ ml: "auto" }}>
                {row.total.toLocaleString("th-TH", {
                  style: "currency",
                  currency: "THB",
                })}
              </Typography>
            </Stack>

            <Stack spacing={0.25}>
              <Typography>
                <strong>ลูกค้า:</strong> {row.customerName ?? "-"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {row.phone ?? "-"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                จำนวน {row.itemsCount} รายการ
              </Typography>
            </Stack>

            {/* Actions */}
            <Stack
              direction="row"
              spacing={0.5}
              justifyContent="flex-end"
              sx={{ pt: 0.5 }}
            >
              <Tooltip title="รายละเอียด">
                <IconButton
                  size="small"
                  onClick={() => onViewDetail(row)}
                  aria-label="ดูรายละเอียด"
                >
                  <VisibilityOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="พิมพ์ใบเสร็จ">
                <IconButton
                  size="small"
                  onClick={() => onPrint(row.id)}
                  aria-label="พิมพ์"
                >
                  <PrintIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip
                title={
                  row.paymentStatus === "PAID"
                    ? "คืนเงิน"
                    : "คืนเงิน (ต้องจ่ายก่อน)"
                }
              >
                <span>
                  <IconButton
                    size="small"
                    onClick={() => onRefund(row.id)}
                    aria-label="คืนเงิน"
                    disabled={
                      row.paymentStatus !== "PAID" || refundingId === row.id
                    }
                  >
                    <PointOfSaleIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <IconButton
                size="small"
                onClick={(e) => setAnchor(e.currentTarget)}
                aria-label="เพิ่มเติม"
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Menu
              open={open}
              anchorEl={anchor}
              onClose={() => setAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              {(
                [
                  "PENDING",
                  "COOKING",
                  "READY",
                  "COMPLETED",
                  "CANCELLED",
                ] as OrderStatus[]
              ).map((s) => {
                const can = allowed[row.status].includes(s) || s === row.status;
                return (
                  <MenuItem
                    key={s}
                    disabled={!can}
                    selected={row.status === s}
                    onClick={() => {
                      if (can) onChangeStatus(row.id, s);
                      setAnchor(null);
                    }}
                  >
                    เปลี่ยนสถานะ → {s}
                  </MenuItem>
                );
              })}
            </Menu>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // ===== 💻 Desktop: Table row =====
  return (
    <TableRow hover sx={{ opacity: row.status === "CANCELLED" ? 0.6 : 1 }}>
      {/* ลำดับซ้ายสุด */}
      <TableCell align="center" sx={{ whiteSpace: "nowrap", width: 84 }}>
        <Typography fontWeight={800}>{index ?? "-"}</Typography>
      </TableCell>

      <TableCell>
        <Stack spacing={0.25}>
          <Typography fontWeight={800}>{row.code}</Typography>
          <Typography variant="body2" color="text.secondary">
            {row.orderedAt}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell>
        <Stack spacing={0.25}>
          <Typography fontWeight={700}>{row.customerName ?? "-"}</Typography>
          <Typography variant="body2" color="text.secondary">
            {row.phone ?? "-"}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell align="center">{row.itemsCount}</TableCell>
      <TableCell>
        <Chip
          label={channelLabel[row.channel]}
          size="small"
          variant="outlined"
        />
      </TableCell>

      <TableCell align="right">
        <Stack alignItems="flex-end">
          <Typography fontWeight={800}>
            {row.total.toLocaleString("th-TH", {
              style: "currency",
              currency: "THB",
            })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            สุทธิ (รวมส่วนลด/ค่าจัดส่ง)
          </Typography>
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

      <TableCell align="right" sx={{ whiteSpace: "nowrap", minWidth: 150 }}>
        <Tooltip title="รายละเอียด">
          <IconButton
            size="small"
            onClick={() => onViewDetail(row)}
            aria-label="ดูรายละเอียด"
          >
            <VisibilityOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="พิมพ์ใบเสร็จ">
          <IconButton
            size="small"
            onClick={() => onPrint(row.id)}
            aria-label="พิมพ์"
          >
            <PrintIcon />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={
            row.paymentStatus === "PAID" ? "คืนเงิน" : "คืนเงิน (ต้องจ่ายก่อน)"
          }
        >
          <span>
            <IconButton
              size="small"
              onClick={() => onRefund(row.id)}
              aria-label="คืนเงิน"
              disabled={row.paymentStatus !== "PAID" || refundingId === row.id}
            >
              <PointOfSaleIcon />
            </IconButton>
          </span>
        </Tooltip>
        <IconButton
          size="small"
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-label="เพิ่มเติม"
        >
          <MoreVertIcon />
        </IconButton>

        <Menu
          open={open}
          anchorEl={anchor}
          onClose={() => setAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          {(
            [
              "PENDING",
              "COOKING",
              "READY",
              "COMPLETED",
              "CANCELLED",
            ] as OrderStatus[]
          ).map((s) => {
            const can = allowed[row.status].includes(s) || s === row.status;
            return (
              <MenuItem
                key={s}
                disabled={!can}
                selected={row.status === s}
                onClick={() => {
                  if (can) onChangeStatus(row.id, s);
                  setAnchor(null);
                }}
              >
                เปลี่ยนสถานะ → {s}
              </MenuItem>
            );
          })}
        </Menu>
      </TableCell>
    </TableRow>
  );
}
