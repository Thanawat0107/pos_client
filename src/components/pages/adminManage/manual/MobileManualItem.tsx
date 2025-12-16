import {
  Avatar,
  Chip,
  IconButton,
  Paper,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import type { Manual } from "../../../../@types/dto/Manual";

type Props = {
  row: Manual;
  index?: number;
  onEdit: (row: Manual) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, next: boolean) => void;
};

export default function MobileManualItem({
  row,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.5 }}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        {/* รูป */}
        <Avatar
          variant="rounded"
          src={row.fileUrl}
          sx={{
            width: 80,
            height: 80,
            borderRadius: 2,
            bgcolor: "primary.light",
            color: "primary.main",
            flexShrink: 0,
          }}
        >
          <DescriptionIcon />
        </Avatar>

        <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" justifyContent="space-between">
             <Typography variant="body1" fontWeight={800} noWrap>
                {row.category}
             </Typography>
             <Chip 
               size="small" 
               label={row.targetRole} 
               sx={{ height: 20, fontSize: 10 }}
             />
          </Stack>
          
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {row.content}
          </Typography>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-end"
            pt={1}
          >
            <Typography variant="caption" color="text.secondary">
              {new Date(row.updateAt).toLocaleDateString("th-TH")}
            </Typography>

            <Stack direction="row" spacing={0.5} alignItems="center">
               <Switch
                size="small"
                checked={row.isUsed}
                onChange={(_, v) => onToggleActive(row.id, v)}
              />
              <IconButton size="small" onClick={() => onEdit(row)}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(row.id)}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}