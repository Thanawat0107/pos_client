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

const headCellSx = {
  fontWeight: 800,
  color: "#475569",
  fontSize: "1rem",
  bgcolor: "#F8FAFC",
  py: 2.25,
  letterSpacing: "0.01em",
};

export default function ManageOrderTable({ rows, totalCount, page, pageSize, onPageChange, onPageSizeChange, onSelectOrder, onClearFilters }: Props) {
  const pendingCount    = rows.filter((r) => r.orderStatus === Sd.Status_Pending).length;
  const unpaidCount     = rows.filter((r) => r.orderStatus === Sd.Status_PendingPayment).length;
  const preparingCount  = rows.filter((r) => r.orderStatus === Sd.Status_Preparing).length;
  const readyCount      = rows.filter((r) => r.orderStatus === Sd.Status_Ready).length;
  const newCount        = rows.filter((r) => Date.now() - new Date(r.createdAt).getTime() < 10 * 60_000).length;
  const hasAlerts = pendingCount + unpaidCount + preparingCount + readyCount > 0;

  return (
    <Paper
      elevation={0}
      className="border border-gray-200 rounded-3xl overflow-hidden bg-white shadow-sm"
    >
      {/* ── Urgency Summary Strip ── */}
      {(hasAlerts || newCount > 0) && (
        <Box sx={{ px: 3.5, py: 2, bgcolor: "#FAFAFA", borderBottom: "1px solid #F0F0F0" }}>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: "#94A3B8", mr: 0.5, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              ต้องดำเนินการ
            </Typography>

            {newCount > 0 && (
              <Chip
                size="small"
                label={`ใหม่ ${newCount} รายการ`}
                sx={{
                  bgcolor: "#EFF6FF", color: "#1D4ED8", fontWeight: 800,
                  border: "1.5px solid #BFDBFE",
                  fontSize: "0.85rem",
                  height: 30,
                  animation: "pulse 2s infinite",
                  boxShadow: "0 0 8px #93C5FD66",
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
                  bgcolor: "#FFF7ED", color: "#C2410C", fontWeight: 800,
                  border: "1.5px solid #FED7AA",
                  animation: "pulse 1.5s infinite",
                  fontSize: "0.85rem",
                  height: 30,
                  boxShadow: "0 0 8px #FED7AA88",
                  "& .MuiChip-icon": { color: "#C2410C" },
                }}
              />
            )}
            {unpaidCount > 0 && (
              <Chip
                size="small"
                icon={<PaidIcon sx={{ fontSize: "1rem !important" }} />}
                label={`รอชำระ ${unpaidCount}`}
                sx={{
                  bgcolor: "#FFF1F2", color: "#BE123C", fontWeight: 800,
                  border: "1.5px solid #FECDD3",
                  animation: "pulse 1.5s infinite",
                  fontSize: "0.85rem",
                  height: 30,
                  boxShadow: "0 0 8px #FECDD388",
                  "& .MuiChip-icon": { color: "#BE123C" },
                }}
              />
            )}
            {preparingCount > 0 && (
              <Chip
                size="small"
                icon={<SoupKitchenIcon sx={{ fontSize: "1rem !important" }} />}
                label={`กำลังปรุง ${preparingCount}`}
                sx={{
                  bgcolor: "#FAF5FF", color: "#7E22CE", fontWeight: 800,
                  border: "1.5px solid #DDD6FE",
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
                  bgcolor: "#F0FDF4", color: "#15803D", fontWeight: 800,
                  border: "1.5px solid #BBF7D0",
                  animation: "pulse 2s infinite",
                  fontSize: "0.85rem",
                  height: 30,
                  boxShadow: "0 0 8px #BBF7D088",
                  "& .MuiChip-icon": { color: "#15803D" },
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
                        color: "#E63946",
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
            bgcolor: "#FAFAFA",
            borderTop: "1px solid #F0F0F0",
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
