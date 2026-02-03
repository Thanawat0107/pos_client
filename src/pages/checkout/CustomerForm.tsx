/* eslint-disable @typescript-eslint/no-explicit-any */
import { Paper, Typography, Grid, TextField, InputAdornment } from "@mui/material"; // ✅ เพิ่ม InputAdornment (เผื่อใช้)
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone'; // ✅ เพิ่มไอคอนมือถือ

interface CustomerFormProps {
  customer: {
    name: string;
    phone: string;
    note: string;
  };
  errors: {
    name: boolean;
    phone: boolean;
  };
  setCustomer: (value: any) => void;
}

export default function CustomerForm({ customer, errors, setCustomer }: CustomerFormProps) {
  const handleChange = (field: string, value: string) => {
    setCustomer({ ...customer, [field]: value });
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
      <Typography
        variant="h6"
        fontWeight={700}
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <PersonOutlineIcon color="primary" /> ข้อมูลผู้สั่งซื้อ
      </Typography>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* ชื่อผู้รับ */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="ชื่อผู้รับ"
            placeholder="เช่น คุณสมชาย"
            value={customer.name}
            error={errors.name}
            helperText={errors.name ? "กรุณากรอกชื่อผู้รับ" : ""}
            onChange={(e) => handleChange("name", e.target.value)}
            // ✅ UX: ช่วยจำชื่อที่เคยกรอก
            autoComplete="name" 
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* เบอร์โทรศัพท์ */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="เบอร์โทรศัพท์"
            placeholder="08x-xxx-xxxx"
            value={customer.phone}
            error={errors.phone}
            helperText={errors.phone ? "กรุณากรอกเบอร์โทร 10 หลัก" : ""}
            
            // ✅ UX: สำคัญมากสำหรับมือถือ ทำให้แป้นพิมพ์เป็นตัวเลข
            type="tel" 
            autoComplete="tel"
            
            inputProps={{ maxLength: 10 }}
            onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, ""))}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIphoneIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* หมายเหตุ */}
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="หมายเหตุถึงร้านค้า (ถ้ามี)"
            placeholder="เช่น ไม่ใส่ผักชี, ขอช้อนส้อมด้วย"
            value={customer.note}
            onChange={(e) => handleChange("note", e.target.value)}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}