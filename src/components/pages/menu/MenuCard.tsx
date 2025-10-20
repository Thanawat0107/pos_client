import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import type { SxProps, Theme } from '@mui/material';

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
  currency?: string;                 // default: USD
  sx?: SxProps<Theme>;               // เผื่ออยาก override style ของการ์ด
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
        ...sx,
      }}
    >
      {/* Image */}
      <Box sx={{ p: 2, pb: 0 }}>
        <Box
          component="img"
          src={image}
          alt={name}
          loading="lazy"
          sx={{
            width: "100%",
            aspectRatio: "1/1",
            objectFit: "cover",
            borderRadius: 1,
            bgcolor: "grey.100",
            display: "block",
          }}
        />
      </Box>

      {/* Content */}
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1" fontWeight={700}>
            {name}
          </Typography>
          <Typography variant="subtitle1" fontWeight={700}>
            {price.toLocaleString(undefined, { style: "currency", currency })}
          </Typography>
        </Stack>

        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            {description}
          </Typography>
        )}
      </CardContent>

      {/* Button */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          onClick={() => onAddToCart?.(menu)}
          sx={{
            borderRadius: 1,
            bgcolor: "action.hover",
            borderColor: "divider",
            fontWeight: 700,
            py: 1.25,
          }}
        >
          ADD TO CART
        </Button>
      </CardActions>
    </Card>
  );
}

export default React.memo(MenuCard);
