/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  Paper,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Stack,
  Avatar,
} from "@mui/material";
import { Search, ClipboardList, Info, Utensils, Hash } from "lucide-react";
import { alpha } from "@mui/material/styles";

// ปรับชุดสีสถานะให้ดู Premium (Glow Style)
const getStatusStyles = (status: string) => {
  const s = status?.toLowerCase();
  switch (s) {
    case "done":
    case "completed":
    case "ready":
      return {
        bg: "#f0fdf4",
        text: "#10b981",
        glow: "#10b981",
        label: "ปรุงเสร็จสิ้น",
      };
    case "preparing":
    case "cooking":
      return {
        bg: "#eff6ff",
        text: "#3b82f6",
        glow: "#3b82f6",
        label: "กำลังปรุงอาหาร",
      };
    case "pending":
    case "pendingpayment":
      return {
        bg: "#fff7ed",
        text: "#f59e0b",
        glow: "#f59e0b",
        label: "รอคิวจัดการ",
      };
    case "cancelled":
      return {
        bg: "#fef2f2",
        text: "#ef4444",
        glow: "#ef4444",
        label: "ยกเลิกรายการ",
      };
    default:
      return {
        bg: "#f8fafc",
        text: "#64748b",
        glow: "#94a3b8",
        label: "ไม่ระบุสถานะ",
      };
  }
};

const DetailedReportTable = ({
  data,
  loading,
  onSearch,
}: {
  data: any[];
  loading: boolean;
  onSearch?: (val: string) => void;
}) => {
  const [searchText, setSearchText] = useState("");

  const columns: GridColDef[] = [
    {
      field: "orderHeaderId",
      headerName: "รหัสออเดอร์",
      width: 140,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              p: 0.5,
              bgcolor: "#f1f5f9",
              borderRadius: "6px",
              color: "#64748b",
            }}
          >
            <Hash size={14} />
          </Box>
          <Typography
            variant="body2"
            sx={{ fontWeight: 800, color: "primary.main" }}
          >
            {params.value}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "createdAt",
      headerName: "วันที่และเวลา",
      width: 180,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 600 }}
        >
          {new Date(params.value).toLocaleString("th-TH", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </Typography>
      ),
    },
    {
      field: "menuItemName",
      headerName: "เมนูที่สั่ง",
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 1.5 }}>
          <Avatar
            variant="rounded"
            sx={{
              width: 40,
              height: 40,
              bgcolor: "#f8fafc",
              color: "#94a3b8",
              border: "1px solid #e2e8f0",
            }}
          >
            <Utensils size={18} />
          </Avatar>
          <Box sx={{ overflow: "hidden" }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 800, color: "text.primary" }}
            >
              {params.value}
            </Typography>
            {params.row.note && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mt: 0.5,
                  px: 1,
                  py: 0.2,
                  bgcolor: "#fff1f2",
                  borderRadius: "6px",
                  border: "1px solid #ffe4e6",
                  width: "fit-content",
                }}
              >
                <Info size={12} className="text-rose-500" />
                <Typography
                  sx={{ fontSize: "11px", fontWeight: 700, color: "#e11d48" }}
                >
                  หมายเหตุ: {params.row.note}
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      ),
    },
    {
      field: "quantity",
      headerName: "จำนวน",
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Typography
          sx={{
            fontWeight: 900,
            px: 2,
            py: 0.5,
            bgcolor: "#f8fafc",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "totalPrice",
      headerName: "ยอดรวมสุทธิ",
      width: 150,
      headerAlign: "right",
      align: "right",
      renderCell: (params) => (
        <Typography
          sx={{ fontWeight: 900, color: "text.primary", fontSize: "1rem" }}
        >
          ฿
          {params.value?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </Typography>
      ),
    },
    {
      field: "kitchenStatus",
      headerName: "สถานะการปรุง",
      width: 180,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const style = getStatusStyles(params.value);
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 0.8,
              borderRadius: "12px",
              bgcolor: style.bg,
              color: style.text,
              border: "1px solid",
              borderColor: alpha(style.text, 0.1),
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: style.glow,
                boxShadow: `0 0 8px ${alpha(style.glow, 0.6)}`,
                animation:
                  style.glow !== "transparent" ? "pulse 2s infinite" : "none",
              }}
            />
            <Typography sx={{ fontSize: "12px", fontWeight: 800 }}>
              {style.label}
            </Typography>
          </Box>
        );
      },
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "32px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 4px 20px -5px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}
    >
      {/* ส่วนหัวตารางและช่องค้นหา */}
      <Box sx={{ px: 5, pt: 5, pb: 4 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={3}
        >
          <Stack direction="row" alignItems="center" spacing={2.5}>
            <Box
              sx={{
                p: 2,
                bgcolor: "primary.main",
                color: "white",
                borderRadius: "18px",
                boxShadow: `0 10px 20px ${alpha("#4f46e5", 0.2)}`,
              }}
            >
              <ClipboardList size={28} />
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: "text.primary",
                  letterSpacing: "-0.02em",
                  mb: 0.5,
                }}
              >
                รายงานรายการอาหาร
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "text.secondary", fontWeight: 500 }}
              >
                ข้อมูลรายการอาหารแยกตามออเดอร์{" "}
                <span style={{ color: "#64748b" }}>โดยละเอียด</span>
              </Typography>
            </Box>
          </Stack>

          <TextField
            size="medium"
            placeholder="ค้นหาเลขที่ออเดอร์ หรือชื่อเมนู..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              onSearch?.(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ ml: 1 }}>
                  <Search size={20} className="text-slate-400" />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: "100%", md: "400px" },
              "& .MuiOutlinedInput-root": {
                borderRadius: "16px",
                bgcolor: "#f8fafc",
                fontWeight: 600,
                "& fieldset": { borderColor: "#e2e8f0" },
                "&:hover fieldset": { borderColor: "#cbd5e1" },
              },
            }}
          />
        </Stack>
      </Box>

      {/* ส่วนแสดงตาราง DataGrid */}
      <Box sx={{ height: 700, width: "100%", px: 2 }}>
        <DataGrid
          rows={data || []}
          columns={columns}
          getRowId={(row) =>
            `${row.orderHeaderId}-${row.menuItemName}-${row.createdAt}`
          }
          loading={loading}
          rowHeight={80}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "#f8fafc",
              borderBottom: "2px solid #f1f5f9",
              color: "#64748b",
              fontSize: "0.85rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              alignItems: "center",
            },
            "& .MuiDataGrid-row:hover": {
              bgcolor: "#f8fafc",
              cursor: "default",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "1px solid #f1f5f9",
              px: 3,
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default DetailedReportTable;
