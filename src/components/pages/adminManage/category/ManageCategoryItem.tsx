import {
  Chip,
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
import type { MenuCategory } from "../../../../@types/dto/MenuCategory";

type Props = {
  row: MenuCategory;
  index?: number;
  onEdit: (row: MenuCategory) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, next: boolean) => void;
};

export default function ManageCategoryItem({
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
          width: "10%",
          fontWeight: 800,
          fontVariantNumeric: "tabular-nums",
          color: "text.primary",
        }}
      >
        {index ?? "-"}
      </TableCell>

      <TableCell
        align="center"
        sx={{
          width: "30%",
          maxWidth: 260,
        }}
      >
        <Stack spacing={0.25} alignItems="center">
          <Typography fontWeight={700} noWrap>
            {row.name}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell
        align="center"
        sx={{
          width: "25%",
          whiteSpace: "nowrap",
        }}
      >
        <Chip size="small" variant="outlined" label={0} />
      </TableCell>

      <TableCell
        align="center"
        sx={{
          width: "15%",
          whiteSpace: "nowrap",
        }}
      >
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
            {row.isUsed ? "พร้อมใช้" : "ปิด"}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell
        align="center"
        sx={{
          width: "20%",
          whiteSpace: "nowrap",
        }}
      >
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
