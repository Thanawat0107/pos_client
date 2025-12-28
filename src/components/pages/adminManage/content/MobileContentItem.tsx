import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { Content } from "../../../../@types/dto/Content";

const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('th-TH', {
        day: 'numeric', month: 'short'
    });
};

type Props = {
  row: Content;
  index?: number;
  onEdit: (row: Content) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, next: boolean) => void;
};

export default function MobileContentItem({
  row,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.5 }}>
      <Stack direction="row" spacing={1.5}>
        {/* รูปซ้าย */}
        <Avatar
          variant="rounded"
          src={row.imageUrl || "https://via.placeholder.com/150x150.png?text=Img"}
          sx={{
            width: 80,
            height: 80,
            borderRadius: 2,
            bgcolor: "grey.200",
          }}
        />

        {/* ข้อมูลขวา */}
        <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
             <Stack direction="row" justifyContent="space-between" alignItems="start">
                <Typography variant="subtitle2" fontWeight={800} noWrap sx={{ maxWidth: '70%' }}>
                    {row.title}
                </Typography>
                 <Chip 
                    label={row.contentType} 
                    size="small" 
                    sx={{ height: 20, fontSize: 10 }}
                    color={row.contentType === 'Promotion' ? 'warning' : 'default'}
                />
             </Stack>
             
             <Typography variant="caption" color="text.secondary" sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.2
             }}>
                {row.description}
             </Typography>

             <Typography variant="caption" color="primary" fontSize={10}>
                {formatDate(row.startDate)} - {formatDate(row.endDate)}
             </Typography>

             <Stack direction="row" justifyContent="space-between" alignItems="center" pt={0.5}>
                 <Stack direction="row" alignItems="center" spacing={0.5}>
                     <Switch 
                        size="small" 
                        checked={row.isUsed} 
                        onChange={(_, v) => onToggleActive(row.id, v)} 
                     />
                     <Typography variant="caption">{row.isUsed ? "On" : "Off"}</Typography>
                 </Stack>
                 <Box>
                    <IconButton size="small" onClick={() => onEdit(row)}>
                        <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onDelete(row.id)}>
                        <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                 </Box>
             </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}