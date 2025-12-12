import {
  Paper,
  Stack,
  Typography,
  Chip,
  Switch,
  IconButton,
  Box,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { Recipe } from "../../../../@types/dto/Recipe";

type MobileRecipeItemProps = {
  row: Recipe;
  index: number;
  onEdit: (row: Recipe) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, value: boolean) => void;
};

export default function MobileRecipeItem({
  row,
  onEdit,
  onDelete,
  onToggleActive,
}: MobileRecipeItemProps) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
      <Stack spacing={1.5}>
        {/* Header: ชื่อเมนู + สถานะ */}
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={1}
        >
          <Box minWidth={0}>
            <Typography variant="subtitle1" fontWeight={800} noWrap>
              {row.menuItemName || `Menu #${row.menuItemId}`}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
               <Chip 
                  label={`v.${row.version}`} 
                  size="small" 
                  variant="outlined" 
                  sx={{ height: 20, fontSize: 10 }} 
                />
               <Typography variant="caption" color="text.secondary">
                 {new Date(row.createdAt).toLocaleDateString("th-TH")}
               </Typography>
            </Stack>
          </Box>

          <Chip
            size="small"
            label={row.isUsed ? "ใช้งาน" : "ปิด"}
            color={row.isUsed ? "success" : "default"}
            sx={{ height: 24, flexShrink: 0 }}
          />
        </Stack>

        {/* เนื้อหา Instructions แบบย่อ */}
        <Paper 
            variant="outlined" 
            sx={{ p: 1, bgcolor: "grey.50", borderRadius: 1 }}
        >
            <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                }}
            >
                {row.instructions}
            </Typography>
        </Paper>

        {/* Actions Footer */}
        <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            pt={0.5}
        >
            <Stack direction="row" alignItems="center" spacing={1}>
                <Switch
                    size="small"
                    checked={row.isUsed}
                    onChange={(_, v) => onToggleActive(row.id, v)}
                />
                <Typography variant="body2" color="text.secondary">
                    {row.isUsed ? "On" : "Off"}
                </Typography>
            </Stack>

            <Stack direction="row" spacing={0.5}>
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
    </Paper>
  );
}