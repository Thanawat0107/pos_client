import {
  Card,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  CircularProgress,
  Stack,
  Box,
} from "@mui/material";
import ManageOrderItem from "../orderItems/ManageOrderItem"; // Adjust path
import type { OrderHeader } from "../../../../../@types/dto/OrderHeader";

type Props = {
  isLoading: boolean;
  rows: OrderHeader[];
  onSelectOrder: (id: number) => void;
  children?: React.ReactNode; // สำหรับ FilterBar ที่ส่งเข้ามา
};

export default function ManageOrderTable({
  isLoading,
  rows,
  onSelectOrder,
  children,
}: Props) {
  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 3, border: "1px solid #e0e0e0", mb: 4 }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Filter Bar Area */}
        <Box sx={{ mb: 3 }}>{children}</Box>

        {/* Count Summary */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography
            variant="subtitle2"
            fontWeight={700}
            color="text.secondary"
          >
            พบข้อมูล{" "}
            <Box component="span" sx={{ color: "primary.main" }}>
              {rows.length}
            </Box>{" "}
            รายการ
          </Typography>
        </Stack>

        {/* Table */}
        <TableContainer sx={{ border: "1px solid #f0f0f0", borderRadius: 2 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  sx={{
                    bgcolor: "#f9fafb",
                    fontWeight: 700,
                    color: "#637381",
                    width: 60,
                  }}
                >
                  #
                </TableCell>
                <TableCell
                  sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#637381" }}
                >
                  เลขออเดอร์ / รหัสรับ
                </TableCell>
                <TableCell
                  sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#637381" }}
                >
                  ลูกค้า
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#637381" }}
                >
                  ยอดรวมสุทธิ
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: "#f9fafb",
                    fontWeight: 700,
                    color: "#637381",
                    pl: 3,
                  }}
                >
                  สถานะ
                </TableCell>
                <TableCell
                  sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#637381" }}
                >
                  เวลาสั่งซื้อ
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ bgcolor: "#f9fafb", fontWeight: 700, color: "#637381" }}
                >
                  จัดการ
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">ไม่พบรายการ</Typography>
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
      </CardContent>
    </Card>
  );
}
