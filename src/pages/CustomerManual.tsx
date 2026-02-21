/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Stack,
} from "@mui/material";
import { useGetManualsQuery } from "../services/manualApi";
import { CategoryFilter } from "../components/pages/adminManage/manual/CategoryFilter";
import { ManualCard } from "../components/pages/adminManage/manual/ManualCard";
import { ManualDetailModal } from "../components/pages/adminManage/manual/ManualDetailModal";

const CustomerManual = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeManual, setActiveManual] = useState<any>(null);

  const { data, isLoading } = useGetManualsQuery({
    category: selectedCategory,
    pageNumber: 1,
    pageSize: 20,
  });

  const count = data?.result?.length ?? 0;

  return (
    <Box sx={{ bgcolor: "#F1F5F9", minHeight: "100vh", pb: 6 }}>

      {/* ===== Hero Banner ===== */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)",
          pt: 5,
          pb: 7,
          px: 3,
        }}
      >
        <Container maxWidth="sm">
          {/* ไอคอนห้อง / แผนที่ */}
          <Typography sx={{ fontSize: 52, lineHeight: 1, mb: 1 }}>🗺️</Typography>

          <Typography
            sx={{
              fontSize: "34px",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.5px",
              lineHeight: 1.1,
              mb: 0.75,
            }}
          >
            จุดบริการของร้าน
          </Typography>
          <Typography
            sx={{ fontSize: "17px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}
          >
            ช้อนส้อม · น้ำดื่ม · ห้องน้ำ อยู่ที่ไหน?
          </Typography>
        </Container>
      </Box>

      {/* ===== Category Filter — ขึ้นทับ Banner เล็กน้อย ===== */}
      <Container maxWidth="sm" sx={{ mt: -3 }}>
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: "24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <CategoryFilter
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </Box>
      </Container>

      {/* ===== รายการ ===== */}
      <Container maxWidth="sm" sx={{ mt: 3 }}>

        {/* จำนวนรายการ */}
        {!isLoading && count > 0 && (
          <Typography
            sx={{ fontSize: "15px", fontWeight: 700, color: "#9CA3AF", mb: 2, pl: 0.5 }}
          >
            พบ {count} จุดบริการ
          </Typography>
        )}

        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
            <CircularProgress size={36} thickness={5} sx={{ color: "#2563EB" }} />
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {data?.result.map((item) => (
              <ManualCard key={item.id} manual={item} onOpen={setActiveManual} />
            ))}

            {count === 0 && (
              <Box
                sx={{
                  textAlign: "center",
                  py: 10,
                  bgcolor: "white",
                  borderRadius: "24px",
                }}
              >
                <Typography sx={{ fontSize: 48, mb: 1 }}>🔍</Typography>
                <Typography sx={{ fontSize: "18px", fontWeight: 700, color: "#9CA3AF" }}>
                  ไม่มีข้อมูลในหมวดหมู่นี้
                </Typography>
              </Box>
            )}
          </Stack>
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
