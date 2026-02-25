import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Stack,
  Box,
  Button,
  Chip,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import ManageOrderItem from "../orderItems/ManageOrderItem";
import type { OrderHeader } from "../../../../../@types/dto/OrderHeader";
import { Sd } from "../../../../../helpers/SD";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PaidIcon from "@mui/icons-material/Paid";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PaginationBar from "../../../../layouts/PaginationBar";

type Props = {
  rows: OrderHeader[];        // rows ของหน้านี้ (sliced แล้ว)
  totalCount: number;         // จำนวนทั้งหมด (ก่อน slice)
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  onSelectOrder: (id: number) => void;
  onClearFilters: () => void;
};

export default function ManageOrderTable({ rows, totalCount, page, pageSize, onPageChange, onPageSizeChange, onSelectOrder, onClearFilters }: Props) {
  const theme = useTheme();
  const headCellSx = {
    fontWeight: 800,
    color: "text.secondary",
    fontSize: "1rem",
    bgcolor: "action.hover",
    py: 2.25,
    letterSpacing: "0.01em",
  };
  const pendingCount    = rows.filter((r) => r.orderStatus === Sd.Status_Pending).length;
  const unpaidCount     = rows.filter((r) => r.orderStatus === Sd.Status_PendingPayment).length;
  const preparingCount  = rows.filter((r) => r.orderStatus === Sd.Status_Preparing).length;
  const readyCount      = rows.filter((r) => r.orderStatus === Sd.Status_Ready).length;
  const newCount        = rows.filter((r) => Date.now() - new Date(r.createdAt).getTime() < 10 * 60_000).length;
  const hasAlerts = pendingCount + unpaidCount + preparingCount + readyCount > 0;

  return (
    <Paper
      elevation={0}
      sx={{ bgcolor: "background.paper", borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}
    >
      {/* ── Urgency Summary Strip ── */}
      {(hasAlerts || newCount > 0) && (
        <Box sx={{ px: 3.5, py: 2, bgcolor: "background.default", borderBottom: "1px solid", borderColor: "divider" }}>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: "text.disabled", mr: 0.5, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              ต้องดำเนินการ
            </Typography>

            {newCount > 0 && (
              <Chip
                size="small"
                label={`ใหม่ ${newCount} รายการ`}
                sx={{
                  bgcolor: alpha(theme.palette.info.main, 0.12), color: "info.dark", fontWeight: 800,
                  border: "1.5px solid",
                  borderColor: alpha(theme.palette.info.main, 0.3),
                  fontSize: "0.85rem",
                  height: 30,
                  animation: "pulse 2s infinite",
                  boxShadow: `0 0 8px ${alpha(theme.palette.info.main, 0.25)}`,
                  "& .MuiChip-label": { px: 1.5 },
                }}
              />
            )}
            {pendingCount > 0 && (
              <Chip
                size="small"
                icon={<NotificationsActiveIcon sx={{ fontSize: "1rem !important" }} />}
                label={`รออนุมัติ ${pendingCount}`}
                sx={{
                  bgcolor: alpha(theme.palette.warning.main, 0.12), color: "warning.dark", fontWeight: 800,
                  border: "1.5px solid",
                  borderColor: alpha(theme.palette.warning.main, 0.3),
                  animation: "pulse 1.5s infinite",
                  fontSize: "0.85rem",
                  height: 30,
                  boxShadow: `0 0 8px ${alpha(theme.palette.warning.main, 0.25)}`,
                  "& .MuiChip-icon": { color: "warning.dark" },
                }}
              />
            )}
            {unpaidCount > 0 && (
              <Chip
                size="small"
                icon={<PaidIcon sx={{ fontSize: "1rem !important" }} />}
                label={`รอชำระ ${unpaidCount}`}
                sx={{
                  bgcolor: alpha(theme.palette.error.main, 0.12), color: "error.dark", fontWeight: 800,
                  border: "1.5px solid",
                  borderColor: alpha(theme.palette.error.main, 0.3),
                  animation: "pulse 1.5s infinite",
                  fontSize: "0.85rem",
                  height: 30,
                  boxShadow: `0 0 8px ${alpha(theme.palette.error.main, 0.25)}`,
                  "& .MuiChip-icon": { color: "error.dark" },
                }}
              />
            )}
            {preparingCount > 0 && (
              <Chip
                size="small"
                icon={<SoupKitchenIcon sx={{ fontSize: "1rem !important" }} />}
                label={`กำลังปรุง ${preparingCount}`}
                sx={{
                  bgcolor: alpha("#7E22CE", 0.1), color: "#7E22CE", fontWeight: 800,
                  border: "1.5px solid",
                  borderColor: alpha("#7E22CE", 0.25),
                  fontSize: "0.85rem",
                  height: 30,
                  "& .MuiChip-icon": { color: "#7E22CE" },
                }}
              />
            )}
            {readyCount > 0 && (
              <Chip
                size="small"
                icon={<CheckCircleOutlineIcon sx={{ fontSize: "1rem !important" }} />}
                label={`พร้อมรับ ${readyCount}`}
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.12), color: "success.dark", fontWeight: 800,
                  border: "1.5px solid",
                  borderColor: alpha(theme.palette.success.main, 0.3),
                  animation: "pulse 2s infinite",
                  fontSize: "0.85rem",
                  height: 30,
                  boxShadow: `0 0 8px ${alpha(theme.palette.success.main, 0.25)}`,
                  "& .MuiChip-icon": { color: "success.dark" },
                }}
              />
            )}
          </Stack>
        </Box>
      )}

      <TableContainer>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ ...headCellSx, width: 60, pl: 3 }}>
                #
              </TableCell>
              <TableCell sx={headCellSx}>เลขออเดอร์ / รหัสรับ</TableCell>
              <TableCell sx={headCellSx}>ลูกค้า</TableCell>
              <TableCell align="right" sx={headCellSx}>
                ยอดรวมสุทธิ
              </TableCell>
              <TableCell sx={{ ...headCellSx, pl: 3 }}>สถานะ</TableCell>
              <TableCell sx={headCellSx}>เวลาสั่งซื้อ</TableCell>
              <TableCell align="right" sx={{ ...headCellSx, pr: 3 }}>
                จัดการ
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 14 }}>
                  <Stack spacing={2} alignItems="center">
                    <Typography color="text.secondary" variant="h6" fontWeight={700}>
                      ไม่พบรายการออเดอร์ที่คุณค้นหา
                    </Typography>
                    <Button
                      variant="text"
                      onClick={onClearFilters}
                      sx={{
                        fontWeight: 700,
                        color: "primary.main",
                        textDecoration: "underline",
                        textTransform: "none",
                      }}
                    >
                      ล้างตัวกรองทั้งหมด
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, i) => (
                <ManageOrderItem
                  key={row.id}
                  row={row}
                  index={i + 1}
                  onView={() => onSelectOrder(row.id)}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination footer */}
      {totalCount > 0 && (
        <Box
          sx={{
            px: 4,
            py: 2.5,
            bgcolor: "background.default",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <PaginationBar
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            showSummary
            showPageSizeSelect
            pageSizeOptions={[10, 20, 50, 100]}
            align="center"
          />
        </Box>
      )}
    </Paper>
  );
}
