/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
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
import DownloadIcon from "@mui/icons-material/Download";
import QrCodeIcon from "@mui/icons-material/QrCode";
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
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: qrData, isLoading: isQrLoading } =
    useGetPaymentQRQuery(orderId, { skip: !dialogOpen });

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
        setDialogOpen(false);
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

  // ถ้ากำลัง verify ให้แสดง progress card แทน
  if (isVerifying || disabled) {
    return (
      <Card
        sx={{
          borderRadius: 1,
          border: "2px solid",
          borderColor: "success.main",
          boxShadow: "0 4px 20px rgba(46,125,50,0.15)",
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 4,
          }}
        >
          <CircularProgress size={48} thickness={5} color="success" sx={{ mb: 2 }} />
          <Typography variant="h6" fontWeight={900} color="success.main" gutterBottom>
            กำลังตรวจสอบสลิป...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 260, textAlign: "center" }}>
            กรุณารอสักครู่ ระบบกำลังยืนยันยอดเงินผ่านธนาคารโดยอัตโนมัติ
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Collapsed trigger card */}
      <Card
        sx={{
          borderRadius: 1,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          border: "2px dashed",
          borderColor: "primary.main",
          overflow: "hidden",
        }}
      >
        <CardActionArea onClick={() => setDialogOpen(true)}>
          <CardContent sx={{ py: 2.5, px: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  bgcolor: "primary.main",
                  borderRadius: 1,
                  p: 1.2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <QrCodeIcon sx={{ color: "#fff", fontSize: 28 }} />
              </Box>
              <Box sx={{ flex: 1, textAlign: "left" }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  ยังไม่ได้ชำระเงิน
                </Typography>
                <Typography variant="h6" fontWeight={900} color="primary.main" lineHeight={1.2}>
                  กดเพื่อสแกน QR ชำระเงิน
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  ยอดชำระ
                </Typography>
                <Typography variant="h6" fontWeight={900} color="primary.main">
                  ฿{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>

      {/* Full payment dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 1, mx: 2 } }}
      >
        <DialogTitle sx={{ pb: 0, pt: 2.5, px: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={900}>
              ชำระเงินผ่าน PromptPay
            </Typography>
            <IconButton size="small" onClick={() => setDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            สแกน QR Code และแนบสลิปเพื่อยืนยัน
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 3, pt: 2 }}>
          {/* ยอดเงิน */}
          <Box sx={{ bgcolor: "primary.50", py: 1.5, borderRadius: 1, mb: 3, textAlign: "center" }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 800, color: "primary.main", textTransform: "uppercase", letterSpacing: 1 }}
            >
              ยอดเงินที่ต้องชำระ
            </Typography>
            <Typography
              variant="h3"
              fontWeight={1000}
              sx={{ color: "primary.main", mt: 0.5, fontSize: { xs: "2.2rem", sm: "2.8rem" } }}
            >
              ฿{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Typography>
          </Box>

          {/* QR Code */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 240,
              bgcolor: "background.paper",
              borderRadius: 1,
              mb: 3,
              border: "1px solid",
              borderColor: "divider",
              p: 2,
            }}
          >
            {isQrLoading ? (
              <Stack alignItems="center" spacing={2}>
                <CircularProgress size={40} />
                <Typography variant="body2" fontWeight={600} color="text.secondary">
                  กำลังสร้าง QR Code ส่วนตัว...
                </Typography>
              </Stack>
            ) : qrData ? (
              <>
                <Box
                  component="img"
                  src={getQrSrc(qrData)}
                  alt="PromptPay QR"
                  sx={{ width: "100%", maxWidth: 220, height: "auto", display: "block" }}
                />
                <Typography variant="caption" sx={{ mt: 1.5, color: "text.disabled", fontWeight: 600 }}>
                  Thai QR Payment / PromptPay
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    const src = getQrSrc(qrData);
                    const a = document.createElement("a");
                    a.href = src;
                    a.download = `QR_Payment_${orderId}.png`;
                    a.click();
                  }}
                  sx={{ mt: 1.5, borderRadius: 1, fontWeight: 700, fontSize: "0.85rem", textTransform: "none" }}
                >
                  บันทึก QR ลงเครื่อง
                </Button>
              </>
            ) : (
              <Alert severity="error" sx={{ width: "90%" }}>
                ไม่สามารถโหลด QR Code ได้
              </Alert>
            )}
          </Box>

          <Divider sx={{ mb: 3, borderStyle: "dashed" }} />

          {/* Slip upload */}
          <Stack spacing={2}>
            {!previewUrl ? (
              <Button
                component="label"
                variant="outlined"
                fullWidth
                startIcon={<CloudUploadIcon sx={{ fontSize: 24 }} />}
                disabled={isQrLoading}
                sx={{
                  borderRadius: 1,
                  py: 2,
                  borderStyle: "dashed",
                  borderWidth: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 800,
                  "&:hover": { borderWidth: 2, bgcolor: "action.hover" },
                }}
              >
                เลือกรูปภาพสลิปเงินโอน
                <VisuallyHiddenInput type="file" accept="image/*" onChange={handleFileChange} />
              </Button>
            ) : (
              <Stack alignItems="center" sx={{ position: "relative", width: "100%" }}>
                <Typography
                  variant="body2"
                  fontWeight={800}
                  color="success.main"
                  sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 0.5 }}
                >
                  <CheckCircleIcon fontSize="small" /> เลือกสลิปเรียบร้อยแล้ว
                </Typography>
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={previewUrl}
                    alt="Slip Preview"
                    style={{
                      maxWidth: "180px",
                      maxHeight: "260px",
                      borderRadius: 2,
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
              disabled={!selectedFile || isUploading}
              onClick={handleConfirmPayment}
              sx={{
                borderRadius: 1,
                py: 2,
                fontWeight: 900,
                fontSize: "1.1rem",
                boxShadow: "0 8px 24px rgba(46, 125, 50, 0.3)",
                textTransform: "none",
              }}
            >
              {isUploading ? (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CircularProgress size={22} color="inherit" />
                  <span>กำลังส่งข้อมูล...</span>
                </Stack>
              ) : (
                "ยืนยันและส่งหลักฐานโอนเงิน"
              )}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
