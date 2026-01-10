import { Box, Container, Stack, Typography, Button, Alert } from "@mui/material";
import MenuScroller from "../../../components/pages/menu/MenuScroller"; // ปรับ path ตามจริง
import type { MenuItemDto } from "../../../@types/dto/MenuItem";

interface HomeMenuProps {
  items: MenuItemDto[];
  isError: boolean;
}

export default function HomeMenu({ items, isError }: HomeMenuProps) {
  return (
    <>
      <Container maxWidth="xl">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Box>
            <Typography variant="h5" fontWeight={800} color="text.primary">
              เมนูยอดฮิต 🍛
            </Typography>
            <Typography variant="body2" color="text.secondary">
              อร่อย ถูกใจ ชาว KRU
            </Typography>
          </Box>
          <Button size="small" color="inherit">
            ดูทั้งหมด
          </Button>
        </Stack>
      </Container>

      {isError ? (
        <Box textAlign="center" py={4}>
          <Alert severity="error" sx={{ display: "inline-flex", borderRadius: 2 }}>
            ไม่สามารถโหลดเมนูอาหารได้
          </Alert>
        </Box>
      ) : (
        <MenuScroller
          items={items}
          currency="THB"
          onAddToCart={(p) => console.log("Add:", p)}
          maxWidth="xl"
        />
      )}
    </>
  );
}