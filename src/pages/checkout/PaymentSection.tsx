import { useEffect } from "react";
import { alpha } from "@mui/material/styles";
import { Paper, Typography, Box, Alert } from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
// import MoneyIcon from '@mui/icons-material/Money'; // ปิดไว้เพราะไม่ได้ใช้
import QrCodeIcon from "@mui/icons-material/QrCode2";
import { paymentMethods } from "../../helpers/SD";

// แปลง object เป็น array สำหรับการแสดงผล (คอมเมนต์เงินสดออก)
const paymentMethodsList = [
  /* { 
      value: paymentMethods.paymentStatus_Cash, 
      label: "เงินสด (Cash)", 
      description: "ชำระที่เคาน์เตอร์เมื่อรับสินค้า" 
  }, */
  {
    value: paymentMethods.paymentStatus_PromptPay,
    label: "โอนเงิน / QR พร้อมเพย์",
    description: "สแกนจ่าย / แนบสลิปผ่านระบบ",
  },
];

interface PaymentSectionProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  finalTotal: number;
}

export default function PaymentSection({
  paymentMethod,
  setPaymentMethod,
}: PaymentSectionProps) {
  // ✅ Force Logic: บังคับให้เป็น PromptPay เสมอตั้งแต่หน้าจอโหลด
  useEffect(() => {
    // ไม่ว่าค่าเดิมจะเป็นอะไร หรือยอดเงินเท่าไหร่ ให้เลือก PromptPay เท่านั้น
    if (paymentMethod !== paymentMethods.paymentStatus_PromptPay) {
      setPaymentMethod(paymentMethods.paymentStatus_PromptPay);
    }
  }, [paymentMethod, setPaymentMethod]);

  return (
    <Paper
      sx={{
        p: { xs: 2.5, sm: 4 }, // ปรับ Padding ตามขนาดหน้าจอ
        borderRadius: 2,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <Typography
        variant="h5"
        fontWeight={800}
        gutterBottom
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: { xs: 2.5, md: 3 },
          fontSize: { xs: "1.25rem", sm: "1.5rem" }, // ปรับขนาดตัวอักษรหัวข้อ
        }}
      >
        <PaymentIcon sx={{ fontSize: { xs: 28, sm: 32 } }} color="primary" />{" "}
        วิธีการชำระเงิน
      </Typography>

      <Alert
        severity="success"
        sx={{
          mb: 3,
          borderRadius: 2,
          "& .MuiAlert-message": { fontSize: { xs: "0.9rem", sm: "1rem" } },
        }}
      >
        ร้านรองรับ <strong>โอนเงิน / QR พร้อมเพย์</strong> เพื่อความรวดเร็ว
      </Alert>

      {/* ✅ กลับมาใช้ .map() แต่ใส่ Style ชุดใหญ่เข้าไปข้างใน */}
      {paymentMethodsList.map((method) => (
        <Box
          key={method.value}
          sx={{
            p: { xs: 2, sm: 3 }, // ปรับ Padding ของการ์ด
            border: "3px solid",
            borderColor: "success.main",
            bgcolor: (t) => alpha(t.palette.success.main, 0.08),
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            gap: { xs: 1.5, sm: 2 },
            cursor: "pointer",
          }}
        >
          <QrCodeIcon sx={{ fontSize: { xs: 35, sm: 45 }, color: "success.main" }} />
          <Box>
            <Typography
              fontWeight={800}
              color="success.dark"
              sx={{ fontSize: { xs: "1.1rem", sm: "1.3rem" } }}
            >
              {method.label}
            </Typography>
            <Typography
              fontWeight={600}
              color="success.main"
              sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}
            >
              {method.description}
            </Typography>
          </Box>
        </Box>
      ))}

      <Typography
        variant="body1"
        fontWeight={600}
        color="text.secondary"
        sx={{
          mt: 3,
          textAlign: "center",
          fontSize: { xs: "0.9rem", sm: "1.1rem" },
        }}
      >
        * ระบบจะแสดง QR Code ให้หลังจากกดสั่งซื้อ
      </Typography>
    </Paper>
  );
}
