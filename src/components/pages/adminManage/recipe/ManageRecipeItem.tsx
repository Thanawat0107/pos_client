import {
  IconButton,
  Stack,
  Switch,
  Tooltip,
  Typography,
  TableRow,
  TableCell,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { Recipe } from "../../../../@types/dto/Recipe";

type Props = {
  row: Recipe;
  index?: number;
  onEdit: (row: Recipe) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, next: boolean) => void;
};

export default function ManageRecipeItem({
  row,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  return (
    <TableRow hover>
      <TableCell
        align="center"
        sx={{
          width: "5%",
          fontWeight: 800,
          color: "text.primary",
        }}
      >
        {index ?? "-"}
      </TableCell>

      <TableCell sx={{ width: "25%" }}>
        <Stack spacing={0.5}>
          <Typography fontWeight={700} noWrap>
            {row.menuItemName || `Menu ID: ${row.menuItemId}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
             v.{row.version} • {new Date(row.createdAt).toLocaleDateString("th-TH")}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell sx={{ width: "35%" }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            whiteSpace: "normal",
          }}
        >
          {row.instructions}
        </Typography>
      </TableCell>

      <TableCell align="center" sx={{ width: "15%" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={1}
        >
          <Switch
            checked={row.isUsed}
            onChange={(_, v) => onToggleActive(row.id, v)}
            size="small"
          />
          <Typography variant="body2" color="text.secondary">
            {row.isUsed ? "Active" : "Inactive"}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell align="center" sx={{ width: "20%" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={0.5}
        >
          <Tooltip title="แก้ไข">
            <IconButton
              size="small"
              onClick={() => onEdit(row)}
              color="primary"
            >
              <EditOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="ลบ">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(row.id)}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}