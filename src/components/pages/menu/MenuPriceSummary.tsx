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
    <div className="shrink-0 sticky top-24" style={{ width: 340 }}>
      {/* รูปอาหาร (desktop) */}
      <div className="rounded-3xl overflow-hidden shadow-2xl">
        <img
          src={imageUrl || "https://placehold.co/680x680?text=Menu"}
          alt={name}
          className="w-full"
          style={{ aspectRatio: "1", objectFit: "cover" }}
        />
      </div>

      {/* สรุปราคา */}
      <div
        className="rounded-3xl p-6 mt-5"
        style={{
          backgroundColor: theme.palette.background.paper,
          boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <Typography variant="body1" color="text.secondary" fontWeight={600}>
            ราคาต่อชิ้น
          </Typography>
          <Typography variant="body1" fontWeight={700} color="text.primary">
            ฿{basePrice.toLocaleString()}
          </Typography>
        </div>

        <div className="flex justify-between items-center mb-5">
          <Typography variant="body1" color="text.secondary" fontWeight={600}>
            จำนวน
          </Typography>
          <Typography variant="body1" fontWeight={700} color="text.primary">
            x{quantity}
          </Typography>
        </div>

        <div
          className="flex justify-between items-center pt-5"
          style={{
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
