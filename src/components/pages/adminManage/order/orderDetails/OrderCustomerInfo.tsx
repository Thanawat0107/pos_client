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
  Alert,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import PhoneIcon from "@mui/icons-material/Phone";
import { Sd } from "../../../../../helpers/SD";

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
            {order.customerNote && (
              <Alert
                severity="warning"
                icon={false}
                sx={{ mt: 0.5, borderRadius: 2, "& .MuiAlert-message": { fontSize: "0.95rem" } }}
              >
                <strong>Note: </strong>{order.customerNote}
              </Alert>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
