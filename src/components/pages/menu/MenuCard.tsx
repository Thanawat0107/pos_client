import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { memo } from "react";
import { useNavigate } from "react-router-dom"; // 1. นำเข้า useNavigate
import type { MenuItemDto } from "../../../@types/dto/MenuItem";

type Props = {
  menu: MenuItemDto;
  onAddToCart?: (p: MenuItemDto) => void;
  currency?: string;
  sx?: SxProps<Theme>;
};

function MenuCard({ menu, onAddToCart, currency = "USD", sx }: Props) {
  const theme = useTheme();
  const navigate = useNavigate(); // 2. ประกาศตัวแปร navigate

  const { id, name, basePrice, imageUrl, description } = menu; // สมมติว่า DTO มี field 'id'

  const displayImage = imageUrl || "https://placehold.co/600x400?text=No+Image";

  const handleNavigateToDetails = () => {
    navigate(`/menu/${id}`); 
  };

  return (
    <Card
      onClick={handleNavigateToDetails} // 4. ใส่ onClick ที่ตัว Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        transition: "all 0.3s ease-in-out",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        overflow: "hidden",
        cursor: "pointer", // 5. เปลี่ยน mouse cursor
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
          borderColor: "primary.light",
          "& .menu-image": {
            transform: "scale(1.1)",
          },
        },
        ...sx,
      }}
    >
      {/* Image Area */}
      <Box sx={{ position: "relative", overflow: "hidden", pt: "65%" }}>
        <Box
          component="img"
          src={displayImage}
          alt={name}
          className="menu-image"
          loading="lazy"
          decoding="async"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s ease",
          }}
        />

        <Chip
          label={basePrice.toLocaleString(undefined, {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
          })}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            fontWeight: 700,
            backgroundColor: alpha(theme.palette.common.white, 0.9),
            backdropFilter: "blur(4px)",
            color: "text.primary",
            boxShadow: 2,
            height: 28,
          }}
        />
      </Box>

      {/* Content */}
      <CardContent
        sx={{
          flexGrow: 1,
          p: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          lineHeight={1.2}
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
          }}
        >
          {name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            minHeight: "2.5em",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.5,
          }}
        >
          {description || "No description available."}
        </Typography>

        {/* Action Area */}
        <Box sx={{ mt: "auto", pt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            disableElevation
            onClick={(e) => {
              e.stopPropagation(); // 6. 🔥 หยุดการส่งต่อ Event ไม่ให้ Card คลิกทำงาน
              onAddToCart?.(menu);
            }}
            startIcon={<AddShoppingCartIcon />}
            sx={{
              borderRadius: 2.5,
              fontWeight: 600,
              textTransform: "none",
              py: 1.2,
              fontSize: "0.95rem",
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              transition: "filter 0.2s",
              "&:hover": {
                filter: "brightness(110%)",
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
            }}
          >
            Add to Cart
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default memo(MenuCard);