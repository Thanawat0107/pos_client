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
      className="rounded-3xl p-6"
      style={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
      }}
    >
      {/* หัวข้อกลุ่ม */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
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
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{
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
      <div className="flex flex-wrap gap-3">
        {opt.menuOptionDetails.map((detail) => {
          const isSelected = selectedIds.includes(detail.id);
          return (
            <button
              key={detail.id}
              onClick={() => onToggle(opt.id, detail.id, opt.isMultiple)}
              className="flex items-center gap-2 px-5 py-3 rounded-full font-semibold transition-all duration-200 cursor-pointer border-2"
              style={{
                fontSize: "0.95rem",
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
              {isSelected && <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />}
              <span>{detail.name}</span>
              <span
                className="font-bold px-2 py-0.5 rounded-full ml-1"
                style={{
                  fontSize: "0.8rem",
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
