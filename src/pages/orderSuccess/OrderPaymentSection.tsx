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
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
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
  disabled?: boolean;
}

export default function OrderPaymentSection({
  orderId,
  totalAmount,
  onPaymentSuccess,
  onError,
  disabled = false,
}: OrderPaymentSectionProps) {
  const {
    data: qrData,
    isLoading: isQrLoading,
    error: qrError,
  } = useGetPaymentQRQuery(orderId);

  const [confirmPayment, { isLoading: isUploading }] =
    useConfirmPaymentMutation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

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
      const result = await confirmPayment({
        orderId: orderId,
        file: selectedFile,
      }).unwrap();

      if (result.success) {
        setIsVerifying(true);
        onPaymentSuccess();
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
        borderRadius: 5,
        boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
        overflow: "hidden",
        border: isVerifying ? "3px solid #2E7D32" : "none",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <CardContent sx={{ textAlign: "center", p: { xs: 3, sm: 4 } }}>
        {isVerifying || disabled ? (
          <Box
            sx={{
              py: 5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <CircularProgress
              size={70}
              thickness={5}
              color="success"
              sx={{ mb: 3 }}
            />
            <Typography
              variant="h5"
              fontWeight={900}
              color="success.main"
              gutterBottom
            >
              กำลังตรวจสอบสลิป...
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 280, mx: "auto" }}
            >
              กรุณารอสักครู่ ระบบกำลังยืนยันยอดเงินผ่านธนาคารโดยอัตโนมัติ
            </Typography>
          </Box>
        ) : (
          <>
            <Typography
              variant="h5"
              fontWeight={900}
              gutterBottom
              sx={{ fontSize: { xs: "1.4rem", sm: "1.5rem" } }}
            >
              ชำระเงินผ่าน PromptPay
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 2, fontSize: "0.95rem" }}
            >
              สแกน QR Code และแนบสลิปเพื่อยืนยัน
            </Typography>

            {/* ยอดเงินที่ต้องชำระ - ขยายให้ใหญ่และชัดเจน */}
            <Box sx={{ bgcolor: "primary.50", py: 2, borderRadius: 3, mb: 3 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 800,
                  color: "primary.main",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                ยอดเงินที่ต้องชำระ
              </Typography>
              <Typography
                variant="h3"
                fontWeight={1000}
                sx={{
                  color: "primary.main",
                  mt: 0.5,
                  fontSize: { xs: "2.5rem", sm: "3rem" },
                }}
              >
                ฿
                {totalAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </Typography>
            </Box>

            {/* QR Code Area */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 280,
                bgcolor: "#fff",
                borderRadius: 4,
                mb: 4,
                border: "2px solid #edf2f7",
                p: 2,
                position: "relative",
              }}
            >
              {isQrLoading ? (
                <Stack alignItems="center" spacing={2}>
                  <CircularProgress size={40} />
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    กำลังสร้าง QR Code ส่วนตัว...
                  </Typography>
                </Stack>
              ) : qrData ? (
                <>
                  <Box
                    component="img"
                    src={getQrSrc(qrData)}
                    alt="PromptPay QR"
                    sx={{
                      width: "100%",
                      maxWidth: 240,
                      height: "auto",
                      display: "block",
                      filter: "drop-shadow(0px 4px 10px rgba(0,0,0,0.05))",
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ mt: 2, color: "text.disabled", fontWeight: 600 }}
                  >
                    Thai QR Payment / PromptPay
                  </Typography>
                </>
              ) : (
                <Alert severity="error" sx={{ width: "90%" }}>
                  ไม่สามารถโหลด QR Code ได้
                </Alert>
              )}
            </Box>

            <Divider sx={{ mb: 4, borderStyle: "dashed" }} />

            {/* Action Area */}
            <Stack spacing={2.5}>
              {!previewUrl ? (
                <Button
                  component="label"
                  variant="outlined"
                  fullWidth
                  startIcon={<CloudUploadIcon sx={{ fontSize: 28 }} />}
                  disabled={isQrLoading}
                  sx={{
                    borderRadius: 4,
                    py: 2.5,
                    borderStyle: "dashed",
                    borderWidth: 2,
                    textTransform: "none",
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    "&:hover": { borderWidth: 2, bgcolor: "action.hover" },
                  }}
                >
                  เลือกรูปภาพสลิปเงินโอน
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
              ) : (
                <Stack
                  alignItems="center"
                  sx={{ position: "relative", width: "100%" }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={800}
                    color="success.main"
                    sx={{
                      mb: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <CheckCircleIcon fontSize="small" /> เลือกสลิปเรียบร้อยแล้ว
                  </Typography>
                  <Box sx={{ position: "relative", display: "inline-block" }}>
                    <img
                      src={previewUrl}
                      alt="Slip Preview"
                      style={{
                        maxWidth: "200px",
                        maxHeight: "300px",
                        borderRadius: 16,
                        border: "4px solid #4caf50",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      }}
                    />
                    <IconButton
                      onClick={handleRemoveFile}
                      sx={{
                        position: "absolute",
                        top: -12,
                        right: -12,
                        bgcolor: "error.main",
                        color: "white",
                        boxShadow: 3,
                        "&:hover": { bgcolor: "error.dark" },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Stack>
              )}

              <Button
                variant="contained"
                color="success"
                fullWidth
                size="large"
                disabled={!selectedFile || isUploading || disabled}
                onClick={handleConfirmPayment}
                sx={{
                  borderRadius: 4,
                  py: { xs: 2.2, sm: 2.5 },
                  fontWeight: 900,
                  fontSize: "1.2rem",
                  boxShadow: "0 8px 24px rgba(46, 125, 50, 0.3)",
                  textTransform: "none",
                }}
              >
                {isUploading ? (
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <CircularProgress size={24} color="inherit" />
                    <span>กำลังส่งข้อมูล...</span>
                  </Stack>
                ) : (
                  "ยืนยันและส่งหลักฐานโอนเงิน"
                )}
              </Button>
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}
