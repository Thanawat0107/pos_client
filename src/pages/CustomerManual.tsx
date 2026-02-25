import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { Manual } from "../@types/dto/Manual";
import { useGetManualsQuery } from "../services/manualApi";
import { CategoryFilter } from "../components/pages/adminManage/manual/CategoryFilter";
import { ManualCard } from "../components/pages/adminManage/manual/ManualCard";
import { ManualDetailModal } from "../components/pages/adminManage/manual/ManualDetailModal";

const CustomerManual = () => {
  useTheme(); // ensure theme context
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeManual, setActiveManual] = useState<Manual | null>(null);

  const { data, isLoading } = useGetManualsQuery({
    category: selectedCategory,
    pageNumber: 1,
    pageSize: 50,
  });

  const items = data?.result ?? [];
  const count = items.length;

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>

      {/* ===== Header ===== */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #C2410C 0%, #EA580C 50%, #F97316 100%)",
          py: 3,
          px: 3,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 0.75 }}>
            <Typography sx={{ fontSize: 40, lineHeight: 1 }}>🍽️</Typography>
            <Typography
              sx={{ fontSize: { xs: "24px", sm: "28px" }, fontWeight: 900, color: "#fff", lineHeight: 1.15 }}
            >
              จุดบริการของร้าน
            </Typography>
            <Typography sx={{ fontSize: "15px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
              ช้อนส้อม · น้ำดื่ม · ห้องน้ำ อยู่ที่ไหน?
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* ===== Category Filter — sticky (ขยับลงตาม navbar 64px) ===== */}
      <Box
        sx={{
          position: "sticky",
          top: 64,
          zIndex: 10,
          bgcolor: "background.paper",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="md" disableGutters>
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </Container>
      </Box>

      {/* ===== รายการการ์ด ===== */}
      <Container maxWidth="md" sx={{ py: 3, px: { xs: 2, sm: 3 } }}>

        {/* จำนวนรายการ */}
        {!isLoading && count > 0 && (
          <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "text.secondary", mb: 2 }}>
            พบ {count} จุดบริการ
          </Typography>
        )}

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={36} thickness={5} color="primary" />
          </Box>
        ) : count === 0 ? (
          <Box sx={{ textAlign: "center", py: 10, bgcolor: "background.paper", borderRadius: "24px", border: "1.5px solid", borderColor: "divider" }}>
            <Typography sx={{ fontSize: 48, mb: 1 }}>🔍</Typography>
            <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "text.secondary" }}>
              ไม่มีข้อมูลในหมวดหมู่นี้
            </Typography>
          </Box>
        ) : (
          /* Grid 2 คอลัมน์ตายตัว — มือถือเป็น 1 คอลัมน์ */
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 2.5,
              /* จัดการ์ดคี่ท้ายสุดให้กึ่งกลาง */
              "& > :last-child:nth-of-type(odd)": {
                gridColumn: { sm: "1 / -1" },
                maxWidth: { sm: "calc(50% - 10px)" },
                mx: "auto",
                width: "100%",
              },
            }}
          >
            {items.map((item) => (
              <ManualCard key={item.id} manual={item} onOpen={setActiveManual} />
            ))}
          </Box>
        )}
      </Container>

      <ManualDetailModal
        open={Boolean(activeManual)}
        onClose={() => setActiveManual(null)}
        manual={activeManual}
      />
    </Box>
  );
};

export default CustomerManual;

