/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Paper,
  Typography,
  Grid, // ปรับให้สอดคล้องกับ Grid ที่ใช้ในหน้าหลัก
  TextField,
  InputAdornment,
  Box,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

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

export default function CustomerForm({
  customer,
  errors,
  setCustomer,
}: CustomerFormProps) {
  const handleChange = (field: string, value: string) => {
    setCustomer({ ...customer, [field]: value });
  };

  return (
    <Paper
      sx={{
        p: { xs: 2.5, sm: 3, md: 4 }, // ปรับ Padding ตามขนาดหน้าจอ
        borderRadius: 4,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      {/* หัวข้อใหญ่ชัดเจน */}
      <Typography
        variant="h5"
        fontWeight={800}
        gutterBottom
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          color: "#1a2a3a",
          mb: { xs: 2.5, md: 3.5 }, // ลดระยะห่างบนมือถือ
          fontSize: { xs: "1.25rem", sm: "1.5rem" }, // ปรับขนาดตัวอักษรหัวข้อ
        }}
      >
        <PersonOutlineIcon
          sx={{ fontSize: { xs: 28, sm: 32 } }}
          color="primary"
        />{" "}
        ข้อมูลผู้สั่งซื้อ
      </Typography>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
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
            autoComplete="name"
            InputProps={{
              sx: {
                fontSize: { xs: "1rem", sm: "1.1rem" },
                fontWeight: 600,
                borderRadius: 3,
                height: { xs: "56px", sm: "60px" }, // ลดความสูงลงเล็กน้อยบนมือถือ
              },
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon color="primary" />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              sx: { fontSize: { xs: "0.9rem", sm: "1.1rem" }, fontWeight: 500 },
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
            type="tel"
            autoComplete="tel"
            inputProps={{ maxLength: 10 }}
            onChange={(e) =>
              handleChange("phone", e.target.value.replace(/\D/g, ""))
            }
            InputProps={{
              sx: {
                fontSize: { xs: "1.1rem", sm: "1.2rem" },
                fontWeight: 700,
                borderRadius: 3,
                height: { xs: "56px", sm: "60px" },
                letterSpacing: "1px",
              },
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIphoneIcon color="primary" />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              sx: { fontSize: { xs: "0.9rem", sm: "1.1rem" }, fontWeight: 500 },
            }}
          />
        </Grid>

        {/* หมายเหตุ */}
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="หมายเหตุถึงร้านค้า (ถ้ามี)"
            placeholder="เช่น ไม่ใส่ผักชี, ขอช้อนส้อมด้วย"
            value={customer.note}
            onChange={(e) => handleChange("note", e.target.value)}
            InputProps={{
              sx: {
                fontSize: { xs: "1rem", sm: "1.1rem" },
                borderRadius: 3,
                p: { xs: 1.5, sm: 2 },
              },
              startAdornment: (
                <InputAdornment
                  position="start"
                  sx={{ alignSelf: "flex-start", mt: 1 }}
                >
                  <ChatBubbleOutlineIcon color="action" />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              sx: { fontSize: { xs: "0.9rem", sm: "1.1rem" }, fontWeight: 500 },
            }}
          />
        </Grid>
      </Grid>

      {/* เพิ่มคำแนะนำเล็กน้อยข้างล่างเพื่อให้ดูเป็นกันเอง */}
      <Box sx={{ mt: 2 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: { xs: "0.75rem", sm: "0.9rem" }, display: "block" }}
        >
          * ข้อมูลชื่อและเบอร์โทรจะใช้เพื่อการติดต่อรับสินค้าเท่านั้น
        </Typography>
      </Box>
    </Paper>
  );
}
