import { Typography, TextField, useTheme } from "@mui/material";
import StickyNote2RoundedIcon from "@mui/icons-material/StickyNote2Rounded";

interface MenuNoteFieldProps {
  value: string;
  onChange: (val: string) => void;
}

export default function MenuNoteField({ value, onChange }: MenuNoteFieldProps) {
  const theme = useTheme();

  return (
    <div
      className="rounded-3xl p-6 mt-5"
      style={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
      }}
    >
      {/* หัวข้อ */}
      <div className="flex items-center gap-3 mb-4">
        <StickyNote2RoundedIcon sx={{ color: "text.secondary", fontSize: 22 }} />
        <Typography
          variant="h6"
          fontWeight={800}
          color="text.primary"
          sx={{ fontSize: "1.05rem" }}
        >
          หมายเหตุ
        </Typography>
        <Typography variant="body2" color="text.secondary">
          (ไม่บังคับ)
        </Typography>
      </div>

      {/* ช่องพิมพ์ */}
      <TextField
        fullWidth
        multiline
        rows={3}
        placeholder="เช่น หวานน้อย, แยกน้ำแข็ง, ไม่ผัก..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 3,
            bgcolor: "background.default",
            fontSize: "1rem",
          },
        }}
      />
    </div>
  );
}
