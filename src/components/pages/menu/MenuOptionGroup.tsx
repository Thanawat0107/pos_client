import { Typography, alpha, useTheme } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import type { MenuItemOptionGroup } from "../../../@types/dto/MenuItemOptionGroup";

interface MenuOptionGroupProps {
  group: MenuItemOptionGroup;
  selectedIds: number[];
  onToggle: (optionId: number, detailId: number, isMultiple: boolean) => void;
}

export default function MenuOptionGroup({ group, selectedIds, onToggle }: MenuOptionGroupProps) {
  const theme = useTheme();
  const opt = group.menuItemOption;

  return (
    <div
      style={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
        padding: "1.75rem",
        borderRadius: "1.5rem",
      }}
    >
      {/* หัวข้อกลุ่ม */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Typography
            variant="h6"
            fontWeight={800}
            color="text.primary"
            sx={{ fontSize: "1.05rem" }}
          >
            {opt.name}
          </Typography>
          {opt.isRequired && (
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                paddingLeft: "0.75rem",
                paddingRight: "0.75rem",
                paddingTop: "0.25rem",
                paddingBottom: "0.25rem",
                borderRadius: "9999px",
                backgroundColor: alpha(theme.palette.error.main, 0.12),
                color: theme.palette.error.main,
              }}
            >
              จำเป็น
            </span>
          )}
        </div>
        {opt.isMultiple && (
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            เลือกได้หลายอย่าง
          </Typography>
        )}
      </div>

      {/* ตัวเลือก (pills) */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {opt.menuOptionDetails.map((detail) => {
          const isSelected = selectedIds.includes(detail.id);
          return (
            <button
              key={detail.id}
              onClick={() => onToggle(opt.id, detail.id, opt.isMultiple)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                paddingLeft: "1.5rem",
                paddingRight: "1.5rem",
                paddingTop: "0.875rem",
                paddingBottom: "0.875rem",
                borderRadius: "9999px",
                fontWeight: 600,
                cursor: "pointer",
                border: "2px solid",
                fontSize: "1.05rem",
                transition: "all 0.2s",
                borderColor: isSelected
                  ? theme.palette.primary.main
                  : alpha(theme.palette.text.primary, 0.15),
                backgroundColor: isSelected
                  ? alpha(theme.palette.primary.main, 0.08)
                  : theme.palette.background.default,
                color: isSelected
                  ? theme.palette.primary.main
                  : theme.palette.text.primary,
                transform: isSelected ? "scale(1.04)" : "scale(1)",
                boxShadow: isSelected
                  ? `0 4px 14px ${alpha(theme.palette.primary.main, 0.22)}`
                  : "none",
              }}
            >
              {isSelected && <CheckCircleRoundedIcon sx={{ fontSize: 22 }} />}
              <span>{detail.name}</span>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  paddingLeft: "0.625rem",
                  paddingRight: "0.625rem",
                  paddingTop: "0.25rem",
                  paddingBottom: "0.25rem",
                  borderRadius: "9999px",
                  marginLeft: "0.25rem",
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}
              >
                {detail.extraPrice > 0 ? `+฿${detail.extraPrice}` : "ฟรี"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
