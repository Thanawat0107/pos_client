import { useEffect } from "react";
import {
  Paper,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Alert
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import MoneyIcon from '@mui/icons-material/Money';
import QrCodeIcon from '@mui/icons-material/QrCode2';
import { paymentMethods } from "../../helpers/SD"; // สมมติว่ามี Cash, Transfer

interface PaymentSectionProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  finalTotal: number;
}

export default function PaymentSection({ 
  paymentMethod, 
  setPaymentMethod, 
  finalTotal 
}: PaymentSectionProps) {

  // ✅ Logic: ถ้ายอดเกิน 200 แล้วเลือก Cash อยู่ -> ดีดไปเป็น Transfer ทันที
  useEffect(() => {
    if (finalTotal > 200 && paymentMethod === "cash") {
      setPaymentMethod("promptPay"); // หรือค่าที่เป็น QR Code ใน SD ของคุณ
    }
  }, [finalTotal, paymentMethod, setPaymentMethod]);

  return (
    <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
      <Typography
        variant="h6"
        fontWeight={700}
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <PaymentIcon color="primary" /> วิธีการชำระเงิน
      </Typography>

      {/* ✅ แจ้งเตือนเมื่อยอดเกิน 200 */}
      {finalTotal > 200 && (
        <Alert severity="info" sx={{ mb: 2, fontSize: "0.85rem" }}>
          ยอดชำระเกิน 200 บาท จำเป็นต้องชำระเงินผ่าน QR Code เพื่อยืนยันออเดอร์
        </Alert>
      )}

      <RadioGroup
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        {paymentMethods.map((method) => {
          // ตรวจสอบว่าเป็นวิธีชำระเงินสดหรือไม่ (แก้ string "Cash" ให้ตรงกับ SD ของคุณ)
          const isCash = method.value === "cash"; 
          
          // ถ้าเป็นเงินสด และยอดเกิน 200 -> ให้ Disable
          const isDisabled = isCash && finalTotal > 200;

          return (
            <FormControlLabel
              key={method.value}
              value={method.value}
              disabled={isDisabled} // 🚫 ล็อคปุ่ม
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  {/* Icon ประดับ */}
                  <Box sx={{ mr: 1.5, color: isDisabled ? 'text.disabled' : 'primary.main' }}>
                     {isCash ? <MoneyIcon /> : <QrCodeIcon />}
                  </Box>
                  
                  <Box>
                    <Typography 
                        fontWeight={700} 
                        color={isDisabled ? "text.disabled" : "text.primary"}
                    >
                      {method.label}
                    </Typography>
                    
                    {/* คำอธิบายเพิ่มเติม */}
                    {isCash ? (
                         <Typography variant="caption" color={isDisabled ? "error" : "text.secondary"}>
                            {isDisabled ? "ไม่รองรับยอดเกิน 200 บาท" : "ชำระที่เคาน์เตอร์เมื่อรับสินค้า"}
                         </Typography>
                    ) : (
                         <Typography variant="caption" color="text.secondary">
                            สแกนจ่าย / แนบสลิป
                         </Typography>
                    )}
                  </Box>
                </Box>
              }
              sx={{
                mb: 1,
                p: 1.5,
                border: "1px solid",
                borderColor: paymentMethod === method.value && !isDisabled 
                    ? "primary.main" 
                    : "#eee",
                borderRadius: 2,
                width: "100%",
                ml: 0,
                bgcolor: isDisabled 
                    ? "#f5f5f5" // สีเทาเมื่อ Disabled
                    : paymentMethod === method.value 
                        ? "#f5f9ff" 
                        : "transparent",
                opacity: isDisabled ? 0.7 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: "all 0.2s"
              }}
            />
          );
        })}
      </RadioGroup>
    </Paper>
  );
}