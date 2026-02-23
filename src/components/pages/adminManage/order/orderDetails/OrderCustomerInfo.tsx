/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Card,
  CardContent,
  Stack,
  Typography,
  IconButton,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import PhoneIcon from "@mui/icons-material/Phone";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import PaymentsIcon from "@mui/icons-material/Payments";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import { Sd } from "../../../../../helpers/SD";
import { formatThaiDate, formatThaiTime } from "../../../../../utility/utils";

type Props = {
  order: any;
  isEditing: boolean;
  editForm: any;
  isLoading: boolean;
  setIsEditing: (val: boolean) => void;
  setEditForm: (val: any) => void;
  onSave: () => void;
};

export default function OrderCustomerInfo({
  order,
  isEditing,
  editForm,
  isLoading,
  setIsEditing,
  setEditForm,
  onSave,
}: Props) {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e0e0e0" }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2.5}
        >
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{ display: "flex", alignItems: "center", gap: 1, color: "#222" }}
          >
            <PersonIcon color="action" fontSize="medium" /> ข้อมูลลูกค้า
          </Typography>
          {!isEditing && order.orderStatus !== Sd.Status_Cancelled && (
            <IconButton
              size="medium"
              onClick={() => setIsEditing(true)}
              sx={{ bgcolor: "#f5f5f5", "&:hover": { bgcolor: "#e3f2fd" } }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>

        {isEditing ? (
          <Stack spacing={2.5}>
            <TextField
              label="ชื่อลูกค้า"
              fullWidth
              value={editForm.customerName}
              onChange={(e) =>
                setEditForm({ ...editForm, customerName: e.target.value })
              }
              slotProps={{ input: { style: { fontSize: "1rem" } } }}
            />
            <TextField
              label="เบอร์โทร"
              fullWidth
              value={editForm.customerPhone}
              onChange={(e) =>
                setEditForm({ ...editForm, customerPhone: e.target.value })
              }
              slotProps={{ input: { style: { fontSize: "1rem" } } }}
            />
            <TextField
              label="Note"
              fullWidth
              multiline
              rows={2}
              value={editForm.note}
              onChange={(e) =>
                setEditForm({ ...editForm, note: e.target.value })
              }
              slotProps={{ input: { style: { fontSize: "1rem" } } }}
            />
            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button
                size="medium"
                variant="outlined"
                color="inherit"
                onClick={() => setIsEditing(false)}
                sx={{ fontWeight: 700, borderRadius: 2 }}
              >
                ยกเลิก
              </Button>
              <Button
                size="medium"
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={onSave}
                disabled={isLoading}
                sx={{ fontWeight: 700, borderRadius: 2 }}
              >
                บันทึก
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={2}>
            {/* ชื่อ */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography
                variant="body1"
                color="text.secondary"
                fontWeight={600}
                sx={{ minWidth: 64 }}
              >
                ชื่อ
              </Typography>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: "#1a1a1a", fontSize: { xs: "1rem", sm: "1.15rem" } }}
              >
                {order.customerName || "Walk-in"}
              </Typography>
            </Stack>

            <Divider />

            {/* โทร */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography
                variant="body1"
                color="text.secondary"
                fontWeight={600}
                sx={{ minWidth: 64 }}
              >
                โทร
              </Typography>
              <Stack direction="row" alignItems="center" gap={1}>
                <PhoneIcon fontSize="small" color="action" />
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ color: "#1a1a1a", fontSize: { xs: "1rem", sm: "1.15rem" } }}
                >
                  {order.customerPhone || "—"}
                </Typography>
              </Stack>
            </Stack>

            {/* Note */}
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ minWidth: 64, pt: 0.25 }}>
                Note
              </Typography>
              <Stack direction="row" alignItems="flex-start" gap={1} flex={1}>
                <StickyNote2Icon fontSize="small" sx={{ color: order.customerNote ? "#D97706" : "text.disabled", mt: 0.25, flexShrink: 0 }} />
                {order.customerNote ? (
                  <Typography
                    variant="body1"
                    fontWeight={700}
                    sx={{
                      color: "#92400E",
                      bgcolor: "#FFFBEB",
                      border: "1px solid #FDE68A",
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.5,
                      fontSize: { xs: "0.9rem", sm: "0.95rem" },
                      lineHeight: 1.6,
                    }}
                  >
                    {order.customerNote}
                  </Typography>
                ) : (
                  <Typography variant="body1" color="text.disabled" fontWeight={500}>—</Typography>
                )}
              </Stack>
            </Stack>

            <Divider />

            {/* ช่องทาง */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ minWidth: 64 }}>
                ช่องทาง
              </Typography>
              <Stack direction="row" alignItems="center" gap={1}>
                <StorefrontIcon fontSize="small" color="action" />
                <Typography variant="body1" fontWeight={700} sx={{ color: "#1a1a1a", fontSize: { xs: "0.95rem", sm: "1.05rem" } }}>
                  {order.channel || "—"}
                </Typography>
              </Stack>
            </Stack>

            {/* วิธีชำระเงิน */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ minWidth: 64 }}>
                ชำระด้วย
              </Typography>
              <Stack direction="row" alignItems="center" gap={1}>
                <PaymentsIcon fontSize="small" color="action" />
                <Typography variant="body1" fontWeight={700} sx={{ color: order.paidAt ? "#15803D" : "#1a1a1a", fontSize: { xs: "0.95rem", sm: "1.05rem" } }}>
                  {order.paymentMethod || "—"}
                  {order.paidAt && (
                    <Typography component="span" sx={{ ml: 1, fontSize: "0.8rem", color: "#15803D", fontWeight: 600 }}>
                      (ชำระแล้ว)
                    </Typography>
                  )}
                </Typography>
              </Stack>
            </Stack>

            {/* โปรโมชั่น */}
            {order.appliedPromoCode && (
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ minWidth: 64 }}>
                  โปรโมชั่น
                </Typography>
                <Stack direction="row" alignItems="center" gap={1}
                  sx={{ bgcolor: "#f0fdf4", px: 1.5, py: 0.5, borderRadius: 1.5, border: "1px solid #bbf7d0" }}
                >
                  <LocalOfferIcon sx={{ fontSize: 16, color: "#16a34a" }} />
                  <Typography variant="body2" fontWeight={800} sx={{ color: "#15803D", fontSize: "0.9rem", letterSpacing: 0.5 }}>
                    {order.appliedPromoCode}
                  </Typography>
                </Stack>
              </Stack>
            )}

            <Divider />

            {/* เวลาสั่ง */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body1" color="text.secondary" fontWeight={600} sx={{ minWidth: 64 }}>
                สั่งเมื่อ
              </Typography>
              <Stack direction="row" alignItems="center" gap={1}>
                <AccessTimeFilledIcon sx={{ fontSize: 16, color: "#6366F1" }} />
                <Typography variant="body2" fontWeight={700} sx={{ color: "#1a1a1a", fontSize: "0.95rem" }}>
                  {formatThaiDate(order.createdAt)}{" "}{formatThaiTime(order.createdAt)} น.
                </Typography>
              </Stack>
            </Stack>


          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
