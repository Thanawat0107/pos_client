import { Typography, alpha, useTheme } from "@mui/material";

interface MenuPriceSummaryProps {
  imageUrl?: string;
  name: string;
  basePrice: number;
  quantity: number;
  totalPrice: number;
}

export default function MenuPriceSummary({
  imageUrl,
  name,
  basePrice,
  quantity,
  totalPrice,
}: MenuPriceSummaryProps) {
  const theme = useTheme();

  return (
    <div style={{ flexShrink: 0, position: "sticky", top: "6rem", width: 340 }}>
      {/* รูปอาหาร (desktop) */}
      <div style={{ borderRadius: "1.5rem", overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}>
        <img
          src={imageUrl || "https://placehold.co/680x680?text=Menu"}
          alt={name}
          style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }}
        />
      </div>

      {/* สรุปราคา */}
      <div
        style={{
          borderRadius: "1.5rem",
          padding: "1.5rem",
          marginTop: "1.25rem",
          backgroundColor: theme.palette.background.paper,
          boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <Typography variant="body1" color="text.secondary" fontWeight={600}>
            ราคาต่อชิ้น
          </Typography>
          <Typography variant="body1" fontWeight={700} color="text.primary">
            ฿{basePrice.toLocaleString()}
          </Typography>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <Typography variant="body1" color="text.secondary" fontWeight={600}>
            จำนวน
          </Typography>
          <Typography variant="body1" fontWeight={700} color="text.primary">
            x{quantity}
          </Typography>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "1.25rem",
            borderTop: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
          }}
        >
          <Typography variant="h6" fontWeight={800} color="text.primary">
            รวมทั้งหมด
          </Typography>
          <Typography variant="h5" fontWeight={900} color="primary.main">
            ฿{totalPrice.toLocaleString()}
          </Typography>
        </div>
      </div>
    </div>
  );
}
