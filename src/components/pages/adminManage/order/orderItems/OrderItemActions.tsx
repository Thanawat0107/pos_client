import {
  TableCell,
  Stack,
  Button,
  CircularProgress,
  Fade,
  Tooltip,
  IconButton,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

type ActionConfig = {
  label: string;
  color:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";
  icon: React.ReactNode;
};

type Props = {
  actionInfo: ActionConfig | null;
  isLoading: boolean;
  isPending: boolean;
  onActionClick: (e: React.MouseEvent) => void;
  onCancelClick: (e: React.MouseEvent) => void;
  onViewClick: () => void;
  canCancel: boolean;
};

export default function OrderItemActions({
  actionInfo,
  isLoading,
  canCancel,
  onActionClick,
  onCancelClick,
  onViewClick,
}: Props) {
  return (
    <TableCell align="right" sx={{ width: 220, py: 2.5, pr: 2.5 }}>
      <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">

        {/* ── ปุ่ม Action หลัก ── */}
        {actionInfo && (
          <Fade in={true}>
            <Button
              variant="contained"
              color={actionInfo.color}
              size="medium"
              startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : actionInfo.icon}
              onClick={onActionClick}
              disabled={isLoading}
              sx={{
                borderRadius: "50px",
                textTransform: "none",
                fontWeight: 800,
                fontSize: "0.9rem",
                boxShadow: 3,
                px: 2.5,
                py: 0.9,
                minWidth: 130,
                whiteSpace: "nowrap",
                transition: "transform 0.15s, box-shadow 0.15s",
                "&:hover": { transform: "translateY(-1px)", boxShadow: 5 },
                "&:active": { transform: "scale(0.97)" },
              }}
            >
              {actionInfo.label}
            </Button>
          </Fade>
        )}

        {/* ── ปุ่มยกเลิก ── */}
        {canCancel && (
          <Tooltip title="ปฏิเสธ/ยกเลิก">
            <IconButton
              size="medium"
              color="error"
              onClick={onCancelClick}
              disabled={isLoading}
              sx={{
                border: "1.5px solid #FECDD3",
                bgcolor: "#FFF1F2",
                width: 38,
                height: 38,
                "&:hover": { bgcolor: "#FFE4E6", transform: "scale(1.1)" },
                transition: "transform 0.15s",
              }}
            >
              <CancelIcon sx={{ fontSize: "1.2rem" }} />
            </IconButton>
          </Tooltip>
        )}

        {/* ── ดูรายละเอียด ── */}
        <Tooltip title="ดูรายละเอียด">
          <IconButton
            size="medium"
            onClick={(e) => { e.stopPropagation(); onViewClick(); }}
            sx={{
              color: "#94A3B8",
              width: 38,
              height: 38,
              bgcolor: "#F8FAFC",
              border: "1.5px solid #E2E8F0",
              "&:hover": { bgcolor: "#EFF6FF", color: "#3B82F6", borderColor: "#BFDBFE", transform: "scale(1.1)" },
              transition: "all 0.15s",
            }}
          >
            <VisibilityOutlinedIcon sx={{ fontSize: "1.1rem" }} />
          </IconButton>
        </Tooltip>

      </Stack>
    </TableCell>
  );
}
