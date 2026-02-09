/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, Stack, Typography, IconButton, TextField, Button, Divider, Alert } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import PhoneIcon from '@mui/icons-material/Phone';
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

export default function OrderCustomerInfo({ order, isEditing, editForm, isLoading, setIsEditing, setEditForm, onSave }: Props) {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PersonIcon color="action" /> ข้อมูลลูกค้า</Typography>
          {!isEditing && order.orderStatus !== Sd.Status_Cancelled && ( <IconButton size="small" onClick={() => setIsEditing(true)} sx={{ bgcolor: '#f5f5f5' }}><EditIcon fontSize="small" /></IconButton> )}
        </Stack>
        {isEditing ? (
          <Stack spacing={2}>
            <TextField label="ชื่อลูกค้า" size="small" fullWidth value={editForm.customerName} onChange={(e) => setEditForm({...editForm, customerName: e.target.value})} />
            <TextField label="เบอร์โทร" size="small" fullWidth value={editForm.customerPhone} onChange={(e) => setEditForm({...editForm, customerPhone: e.target.value})} />
            <TextField label="Note" size="small" fullWidth multiline rows={2} value={editForm.note} onChange={(e) => setEditForm({...editForm, note: e.target.value})} />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button size="small" onClick={() => setIsEditing(false)}>ยกเลิก</Button>
              <Button size="small" variant="contained" startIcon={<SaveIcon />} onClick={onSave} disabled={isLoading}>บันทึก</Button>
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={2} alignItems="center"><Typography variant="body2" color="text.secondary" minWidth={60}>ชื่อ:</Typography><Typography variant="body1" fontWeight={500}>{order.customerName || "Walk-in"}</Typography></Stack>
            <Divider variant="inset" component="div" />
            <Stack direction="row" spacing={2} alignItems="center"><Typography variant="body2" color="text.secondary" minWidth={60}>โทร:</Typography><Stack direction="row" alignItems="center" gap={1}><PhoneIcon fontSize="small" color="disabled" /><Typography variant="body1">{order.customerPhone || "-"}</Typography></Stack></Stack>
            {order.customerNote && (<Alert severity="warning" icon={false} sx={{ mt: 1, borderRadius: 2 }}><strong>Note:</strong> {order.customerNote}</Alert>)}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}