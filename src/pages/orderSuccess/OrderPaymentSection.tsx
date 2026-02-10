/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Typography,
  styled,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import {
  useGetPaymentQRQuery,
  useConfirmPaymentMutation,
} from "../../services/paymentApi";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

interface OrderPaymentSectionProps {
  orderId: number;
  totalAmount: number;
  onPaymentSuccess: () => void;
  onError: (msg: string) => void;
}

export default function OrderPaymentSection({
  orderId,
  totalAmount,
  onPaymentSuccess,
  onError,
}: OrderPaymentSectionProps) {
  // 1. Fetch QR Code
const { data: qrData, isLoading: isQrLoading, error } = useGetPaymentQRQuery(orderId);

  console.log("--- DEBUG QR DATA ---");
  console.log("Full Object:", qrData);
  console.log("Error (if any):", error);
  
  // 2. Mutation
  const [confirmPayment, { isLoading: isUploading }] =
    useConfirmPaymentMutation();

  // Local States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // --- Handlers ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // Limit 5MB
        onError("ขนาดไฟล์ต้องไม่เกิน 5MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleConfirmPayment = async () => {
    if (!selectedFile) return;

    try {
      const result = await confirmPayment({
        orderId: orderId,
        file: selectedFile,
      }).unwrap();

      if (result.success) {
        setIsVerifying(true);
        // แจ้ง Parent ว่าสำเร็จ (เพื่อแสดง Toast)
        onPaymentSuccess();

        // Clear Form
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    } catch (err: any) {
      onError(err.data?.message || "การส่งหลักฐานชำระเงินล้มเหลว");
      setIsVerifying(false);
    }
  };

  // ✅ ฟังก์ชันช่วยแปลงข้อมูล QR Code ให้เป็น src ที่ถูกต้อง
  const getQrSrc = (data: any) => {
    if (!data) return "";

    // 1. ดึง String ออกมา ไม่ว่ามันจะเป็น Object หรือ String เพียวๆ
    let base64String = "";
    if (typeof data === "string") {
      base64String = data;
    } else if (typeof data === "object" && data.qrImage) {
      base64String = data.qrImage;
    }

    if (!base64String) return "";

    // 2. เช็คว่ามี Header "data:image..." หรือยัง ถ้าไม่มีให้เติม
    if (base64String.startsWith("data:image")) {
      return base64String;
    } else {
      return `data:image/png;base64,${base64String}`;
    }
  };

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        overflow: "visible",
      }}
    >
      <CardContent sx={{ textAlign: "center", p: 3 }}>
        {isVerifying ? (
          <Box
            sx={{
              py: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <CircularProgress size={50} sx={{ mb: 2 }} />
            <Typography variant="h6" fontWeight={700}>
              กำลังตรวจสอบยอดเงิน...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              กรุณารอสักครู่ ระบบกำลังยืนยันสลิปของคุณ
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              ชำระเงิน (QR Code)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              ยอดชำระ:{" "}
              <strong style={{ color: "#2E7D32", fontSize: "1.2rem" }}>
                ฿{totalAmount.toLocaleString()}
              </strong>
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {/* QR Code Display */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column", // ปรับเป็น column เผื่อมี text error
                justifyContent: "center",
                alignItems: "center",
                minHeight: 250,
                bgcolor: "#f9f9f9",
                borderRadius: 2,
                mb: 3,
                border: "1px dashed #ccc",
                p: 2, // เพิ่ม padding หน่อยเผื่อรูปใหญ่
              }}
            >
              {isQrLoading ? (
                <CircularProgress />
              ) : qrData ? (
                <img
                  src={getQrSrc(qrData)}
                  alt="Payment QR"
                  style={{
                    width: "100%", // เปลี่ยนจาก maxWidth เป็น width ให้ชัดเจน
                    height: "auto", // ให้สูงตามสัดส่วน
                    aspectRatio: "1/1", // บังคับเป็นสี่เหลี่ยมจัตุรัส (ปกติ QR เป็นสี่เหลี่ยม)
                    display: "block",
                    backgroundColor: "#fff", // เผื่อภาพโปร่งใสจะได้เห็นชัด
                  }}
                />
              ) : (
                <Typography color="error">ไม่สามารถโหลด QR Code ได้</Typography>
              )}
            </Box>

            {/* File Upload Section */}
            <Stack spacing={2} alignItems="center">
              {!previewUrl ? (
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    borderRadius: 3,
                    width: "100%",
                    py: 1.5,
                    borderStyle: "dashed",
                  }}
                >
                  แนบสลิปการโอนเงิน
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
              ) : (
                <Box
                  sx={{ position: "relative", width: "100%", maxWidth: 200 }}
                >
                  <img
                    src={previewUrl}
                    alt="Slip Preview"
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                    }}
                  />
                  <IconButton
                    onClick={handleRemoveFile}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: -10,
                      right: -10,
                      bgcolor: "error.main",
                      color: "white",
                      "&:hover": { bgcolor: "error.dark" },
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}

              {/* Confirm Button */}
              <Button
                variant="contained"
                color="success"
                fullWidth
                size="large"
                disabled={!selectedFile || isUploading}
                onClick={handleConfirmPayment}
                startIcon={
                  isUploading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <CheckCircleIcon />
                  )
                }
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
                }}
              >
                {isUploading ? "กำลังอัปโหลด..." : "ยืนยันการชำระเงิน"}
              </Button>
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}
