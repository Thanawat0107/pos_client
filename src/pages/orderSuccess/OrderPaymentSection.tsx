/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
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
  Alert,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
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
  disabled?: boolean; // ✅ เพิ่มเพื่อรับสถานะจากหน้า Success
}

export default function OrderPaymentSection({
  orderId,
  totalAmount,
  onPaymentSuccess,
  onError,
  disabled = false,
}: OrderPaymentSectionProps) {
  // 1. Fetch QR Code
  const {
    data: qrData,
    isLoading: isQrLoading,
    error: qrError,
  } = useGetPaymentQRQuery(orderId);

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
      // 🚀 ส่งข้อมูลไปยัง Backend (CheckSlipAsync)
      const result = await confirmPayment({
        orderId: orderId,
        file: selectedFile,
      }).unwrap();

      if (result.success) {
        setIsVerifying(true);
        // แจ้ง Parent (OrderSuccess) เพื่อเริ่มระบบเฝ้าดู SignalR
        onPaymentSuccess();

        // ล้างไฟล์ที่เลือกไว้
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    } catch (err: any) {
      onError(
        err.data?.message ||
          "การส่งหลักฐานชำระเงินล้มเหลว กรุณาตรวจสอบสลิปอีกครั้ง",
      );
      setIsVerifying(false);
    }
  };

  // ✅ Helper: จัดการข้อมูล QR Code
  const getQrSrc = (data: any) => {
    if (!data) return "";
    let base64String = typeof data === "string" ? data : data.qrImage;
    if (!base64String) return "";

    return base64String.startsWith("data:image")
      ? base64String
      : `data:image/png;base64,${base64String}`;
  };

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        overflow: "hidden",
        border: isVerifying ? "2px solid #2E7D32" : "none",
        transition: "all 0.3s ease",
      }}
    >
      <CardContent sx={{ textAlign: "center", p: 3 }}>
        {isVerifying || disabled ? (
          <Box
            sx={{
              py: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <CircularProgress
              size={60}
              thickness={5}
              color="success"
              sx={{ mb: 2 }}
            />
            <Typography variant="h6" fontWeight={800} color="success.main">
              กำลังตรวจสอบสลิปอัตโนมัติ...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              ระบบจะอัปเดตสถานะให้คุณทันทีเมื่อยืนยันยอดสำเร็จ
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="h6" fontWeight={800} gutterBottom>
              ชำระเงินผ่าน PromptPay
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              สแกน QR Code ด้านล่างด้วยแอปธนาคารของคุณ
            </Typography>
            <Typography
              variant="h5"
              fontWeight={900}
              sx={{ color: "#1976d2", mb: 2 }}
            >
              ฿
              {totalAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* QR Code Area */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 250,
                bgcolor: "#fff",
                borderRadius: 3,
                mb: 3,
                border: "2px solid #f0f0f0",
                p: 2,
                boxShadow: "inset 0 0 10px rgba(0,0,0,0.02)",
              }}
            >
              {isQrLoading ? (
                <Stack alignItems="center" spacing={1}>
                  <CircularProgress size={30} />
                  <Typography variant="caption">
                    กำลังสร้าง QR Code...
                  </Typography>
                </Stack>
              ) : qrData ? (
                <Box
                  component="img"
                  src={getQrSrc(qrData)}
                  alt="PromptPay QR"
                  sx={{
                    width: "100%",
                    maxWidth: 220,
                    height: "auto",
                    display: "block",
                  }}
                />
              ) : (
                <Alert severity="error">โหลด QR Code ไม่สำเร็จ</Alert>
              )}
            </Box>

            {/* Upload Area */}
            <Stack spacing={2} alignItems="center">
              {!previewUrl ? (
                <Button
                  component="label"
                  variant="outlined"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                  disabled={isQrLoading}
                  sx={{
                    borderRadius: 3,
                    py: 1.8,
                    borderStyle: "dashed",
                    borderWidth: 2,
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    "&:hover": { borderWidth: 2 },
                  }}
                >
                  อัปโหลดสลิปเพื่อยืนยัน
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
              ) : (
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    gutterBottom
                  >
                    ตัวอย่างสลิปที่เลือก:
                  </Typography>
                  <Box sx={{ position: "relative", display: "inline-block" }}>
                    <img
                      src={previewUrl}
                      alt="Slip Preview"
                      style={{
                        maxWidth: "180px",
                        borderRadius: 12,
                        border: "2px solid #4caf50",
                      }}
                    />
                    <IconButton
                      onClick={handleRemoveFile}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        bgcolor: "error.main",
                        color: "white",
                        boxShadow: 2,
                        "&:hover": { bgcolor: "error.dark" },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              )}

              <Button
                variant="contained"
                color="success"
                fullWidth
                size="large"
                disabled={!selectedFile || isUploading || disabled}
                onClick={handleConfirmPayment}
                startIcon={
                  isUploading && <CircularProgress size={20} color="inherit" />
                }
                sx={{
                  borderRadius: 3,
                  py: 1.8,
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  boxShadow: "0 6px 20px rgba(46, 125, 50, 0.25)",
                }}
              >
                {isUploading ? "กำลังประมวลผล..." : "ส่งหลักฐานการโอนเงิน"}
              </Button>
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}
