import { Box, Card, CardContent, CardActions, Button, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { memo } from "react";

export type Menu = {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
};

type Props = {
  menu: Menu;
  onAddToCart?: (p: Menu) => void;
  currency?: string;
  sx?: SxProps<Theme>;
};

function MenuCard({ menu, onAddToCart, currency = "USD", sx }: Props) {
  const { name, price, image, description } = menu;

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 2,
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
        // ✅ มือถือ padding กระชับขึ้น
        ...sx,
      }}
    >
      {/* Image */}
      <Box sx={{ p: { xs: 1.25, sm: 2 }, pb: 0 }}>
        <Box
          component="img"
          src={image}
          alt={name}
          loading="lazy"
          decoding="async"
          sx={{
            width: "100%",
            aspectRatio: "1/1",
            objectFit: "cover",
            borderRadius: 1.5,
            bgcolor: "grey.100",
            display: "block",
          }}
        />
      </Box>

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, pt: { xs: 1.25, sm: 2 }, pb: { xs: 1, sm: 1.25 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "65%",
            }}
          >
            {name}
          </Typography>
          <Typography variant="subtitle1" fontWeight={700}>
            {price.toLocaleString(undefined, { style: "currency", currency })}
          </Typography>
        </Stack>

        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              display: "-webkit-box",
              WebkitLineClamp: { xs: 2, sm: 2 },
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </Typography>
        )}
      </CardContent>

      {/* Button */}
      <CardActions sx={{ p: { xs: 1.25, sm: 2 }, pt: 0 }}>
        <Button
          fullWidth
          variant="contained" // ✅ มือถือกดง่าย มองชัด
          color="primary"
          onClick={() => onAddToCart?.(menu)}
          sx={{
            borderRadius: 1.25,
            fontWeight: 700,
            py: { xs: 1, sm: 1.15 },
            textTransform: "none",
          }}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
}

export default memo(MenuCard);
