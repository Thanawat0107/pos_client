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
};

export default function OrderItemActions({
  actionInfo,
  isLoading,
  isPending,
  onActionClick,
  onCancelClick,
  onViewClick,
}: Props) {
  return (
    <TableCell align="right" sx={{ width: 180 }}>
      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        alignItems="center"
      >
        {actionInfo && (
          <Fade in={true}>
            <Button
              variant="contained"
              color={actionInfo.color}
              size="small"
              startIcon={
                isLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  actionInfo.icon
                )
              }
              onClick={onActionClick}
              disabled={isLoading}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                boxShadow: 2,
                minWidth: 110,
              }}
            >
              {actionInfo.label}
            </Button>
          </Fade>
        )}

        {isPending && (
          <Tooltip title="ปฏิเสธ/ยกเลิก">
            <IconButton
              size="small"
              color="error"
              onClick={onCancelClick}
              disabled={isLoading}
              sx={{ border: "1px solid #ffcdd2", bgcolor: "#ffebee" }}
            >
              <CancelIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {!isPending && (
          <Tooltip title="ดูรายละเอียด">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onViewClick();
              }}
              sx={{ color: "text.secondary" }}
            >
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </TableCell>
  );
}
