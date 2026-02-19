import {
  Avatar,
  Chip,
  IconButton,
  Stack,
  Switch,
  Tooltip,
  Typography,
  TableRow,
  TableCell,
  Box,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { MenuItemDto } from "../../../../@types/dto/MenuItem";

// ฟังก์ชันจัดรูปแบบเงินบาท
function formatCurrencyTHB(n: number) {
  return n.toLocaleString("th-TH", { style: "currency", currency: "THB" });
}

type Props = {
  row: MenuItemDto;
  index?: number;
  onEdit: (row: MenuItemDto) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, next: boolean) => void;
};

export default function ManageMenuItem({
  row,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  return (
    <TableRow hover>
      {/* 1. ลำดับ */}
      <TableCell align="center" sx={{ whiteSpace: "nowrap", width: 80, py: 2.5, pl: 4 }}>
        <Typography sx={{ fontSize: "1rem", fontWeight: 800 }} color="text.secondary">
          {index ?? "-"}
        </Typography>
      </TableCell>

      {/* 2. รูปภาพเมนู */}
      <TableCell width={110} sx={{ py: 2.5 }}>
        <Avatar
          variant="rounded"
          src={row.imageUrl || ""}
          alt={row.name}
          imgProps={{
            onError: (e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/96x96.png?text=No+Img";
            },
          }}
          sx={{
            width: 80,
            height: 80,
            borderRadius: 2,
            bgcolor: "grey.50",
            border: "1px solid",
            borderColor: "divider",
          }}
        />
      </TableCell>

      {/* 3. ชื่อเมนู / รายละเอียด / ตัวเลือกเพิ่มเติม */}
      <TableCell sx={{ minWidth: 260, py: 2.5 }}>
        <Stack spacing={1}>
          <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, lineHeight: 1.3 }}>
            {row.name}
          </Typography>

          {row.description && (
            <Typography
              color="text.secondary"
              noWrap
              sx={{ maxWidth: 340, fontSize: "0.9rem" }}
            >
              {row.description}
            </Typography>
          )}

          {/* แสดงกลุ่มตัวเลือก (MenuItemOptionGroups) */}
          {row.menuItemOptionGroups && row.menuItemOptionGroups.length > 0 && (
            <Stack
              direction="row"
              spacing={0.5}
              flexWrap="wrap"
              useFlexGap
            >
              {row.menuItemOptionGroups.map((group, idx) => (
                <Chip
                  key={idx}
                  label={group.menuItemOption?.name || group.menuItemName}
                  size="small"
                  variant="filled"
                  sx={{
                    fontSize: "0.75rem",
                    height: 22,
                    bgcolor: "primary.lighter",
                    color: "primary.dark",
                    fontWeight: 600,
                  }}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </TableCell>

      {/* 4. ราคาเริ่มต้น */}
      <TableCell align="right" sx={{ whiteSpace: "nowrap", width: 140, py: 2.5 }}>
        <Typography sx={{ fontSize: "1.1rem", fontWeight: 700 }} color="primary.main">
          {formatCurrencyTHB(row.basePrice)}
        </Typography>
      </TableCell>

      {/* 5. หมวดหมู่ */}
      <TableCell sx={{ whiteSpace: "nowrap", width: 170, py: 2.5 }}>
        <Chip
          label={row.menuCategoryName ?? "ทั่วไป"}
          variant="outlined"
          color={row.menuCategoryName ? "default" : "warning"}
          sx={{ borderRadius: 1.5, fontWeight: 600, fontSize: "0.9rem", height: 30, px: 0.5 }}
        />
      </TableCell>

      {/* 6. สถานะเปิด/ปิดขาย */}
      <TableCell sx={{ whiteSpace: "nowrap", width: 160, py: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Switch
            checked={row.isUsed && !row.isDeleted}
            onChange={(_, v) => onToggleActive(row.id, v)}
            color="success"
          />
          <Typography
            sx={{ fontSize: "1rem", fontWeight: 600 }}
            color={
              row.isUsed && !row.isDeleted ? "success.main" : "text.disabled"
            }
          >
            {row.isUsed && !row.isDeleted ? "พร้อมขาย" : "ปิดขาย"}
          </Typography>
        </Stack>
      </TableCell>

      {/* 7. อัปเดตล่าสุด */}
      <TableCell sx={{ whiteSpace: "nowrap", width: 160, py: 2.5 }}>
        <Box>
          <Typography sx={{ fontSize: "0.9rem" }} display="block" color="text.secondary">
            {new Date(row.updatedAt).toLocaleDateString("th-TH")}
          </Typography>
          <Typography
            display="block"
            color="text.disabled"
            sx={{ fontSize: "0.8rem", mt: 0.25 }}
          >
            {new Date(row.updatedAt).toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            น.
          </Typography>
        </Box>
      </TableCell>

      {/* 8. การจัดการ */}
      <TableCell align="right" sx={{ whiteSpace: "nowrap", width: 120, py: 2.5, pr: 4 }}>
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Tooltip title="แก้ไขข้อมูล">
            <IconButton
              onClick={() => onEdit(row)}
              sx={{
                p: 1,
                color: "info.main",
                bgcolor: "info.lighter",
                "&:hover": { bgcolor: "info.light" },
              }}
            >
              <EditOutlinedIcon sx={{ fontSize: "1.3rem" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="ลบเมนู">
            <IconButton
              onClick={() => onDelete(row.id)}
              sx={{
                p: 1,
                color: "error.main",
                bgcolor: "error.lighter",
                "&:hover": { bgcolor: "error.light" },
              }}
            >
              <DeleteOutlineIcon sx={{ fontSize: "1.3rem" }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
