/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { 
  Paper, Typography, Box, Chip, TextField, 
  InputAdornment, Stack
} from "@mui/material";
import { Search, ClipboardList, Info, Utensils } from "lucide-react";
import { alpha } from "@mui/material/styles";

// สร้างชุดสีสำหรับสถานะต่างๆ เพื่อความสวยงามและอ่านง่าย
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "completed": case "ready": return { bg: "#ecfdf5", text: "#059669", icon: "success" };
    case "preparing": return { bg: "#eff6ff", text: "#2563eb", icon: "primary" };
    case "pending": case "pendingpayment": return { bg: "#fffbeb", text: "#d97706", icon: "warning" };
    case "cancelled": return { bg: "#fef2f2", text: "#dc2626", icon: "error" };
    default: return { bg: "#f8fafc", text: "#64748b", icon: "default" };
  }
};

const DetailedReportTable = ({ data, loading, onSearch }: { data: any[], loading: boolean, onSearch?: (val: string) => void }) => {
  const [searchText, setSearchText] = useState("");

  const columns: GridColDef[] = [
    { 
      field: 'orderHeaderId', 
      headerName: 'Order ID', 
      width: 100,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={700} color="primary.main">
          #{params.value}
        </Typography>
      )
    },
    { 
      field: 'createdAt', 
      headerName: 'วันที่/เวลา', 
      width: 180,
      valueFormatter: (params) => new Date(params).toLocaleString('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    },
    { 
      field: 'menuItemName', 
      headerName: 'รายการอาหาร', 
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Utensils size={16} color="#64748b" />
          <Box>
            <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
            {params.row.note && (
              <Typography variant="caption" color="error.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Info size={12} /> {params.row.note}
              </Typography>
            )}
          </Box>
        </Stack>
      )
    },
    { field: 'quantity', headerName: 'จำนวน', width: 80, align: 'center' },
    { 
      field: 'totalPrice', 
      headerName: 'ยอดรวม', 
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={800}>
          ฿{params.value.toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'kitchenStatus',
      headerName: 'สถานะครัว',
      width: 140,
      renderCell: (params) => {
        const style = getStatusColor(params.value);
        return (
          <Chip 
            label={params.value || "Waiting"} 
            size="small"
            sx={{ 
              fontWeight: 800, 
              fontSize: '0.7rem',
              bgcolor: style.bg, 
              color: style.text,
              border: `1px solid ${alpha(style.text, 0.2)}`
            }} 
          />
        );
      }
    },
  ];

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 0, // ปรับเป็น 0 เพื่อให้ DataGrid ชิดขอบด้านล่าง
        borderRadius: 5, 
        border: '1px solid', 
        borderColor: 'divider',
        overflow: 'hidden',
        bgcolor: alpha("#fff", 0.9),
        backdropFilter: "blur(20px)",
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)'
      }}
    >
      {/* Header Section */}
      <Stack 
        direction={{ xs: "column", sm: "row" }} 
        justifyContent="space-between" 
        alignItems="center" 
        sx={{ p: 3, gap: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ bgcolor: 'primary.main', p: 1, borderRadius: 2, display: 'flex', color: '#fff' }}>
            <ClipboardList size={24} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} letterSpacing={-0.5}>
              Detailed Item Report
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ตรวจสอบรายการอาหารรายออเดอร์อย่างละเอียด
            </Typography>
          </Box>
        </Stack>

        <TextField
          size="small"
          placeholder="ค้นหา Order ID หรือชื่อเมนู..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            onSearch?.(e.target.value);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} color="#94a3b8" />
              </InputAdornment>
            ),
          }}
          sx={{ 
            width: { xs: '100%', sm: 300 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: '#f8fafc'
            }
          }}
        />
      </Stack>

      {/* Table Section */}
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={data || []}
          columns={columns}
          getRowId={(row) => `${row.orderHeaderId}-${row.menuItemName}`} // ใช้ ID ผสมเพราะ 1 Order มีหลายเมนู
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: '#f8fafc',
              borderBottom: '1px solid',
              borderColor: 'divider',
              color: 'text.secondary',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              fontWeight: 700,
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: alpha("#6366f1", 0.04),
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid',
              borderColor: alpha("#e2e8f0", 0.5),
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default DetailedReportTable;