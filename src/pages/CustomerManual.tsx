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

  return (
    // เปลี่ยนพื้นหลังเป็นสีเทาอ่อนมากเพื่อให้ Card สีขาวดูเด่นและสะอาด
    <Box sx={{ bgcolor: "#F9FAFB", minHeight: "100vh", pb: 5 }}>
      {/* 1. Modern Minimal Header */}
      <Box sx={{ bgcolor: "white", pt: 6, pb: 4, px: 2 }}>
        <Container maxWidth="sm">
          <Stack spacing={0.5}>
            <Typography
              variant="h4"
              fontWeight="900"
              sx={{ color: "#111827", letterSpacing: "-0.5px" }}
            >
              Service Guide
            </Typography>
            <Typography variant="body1" sx={{ color: "#6B7280" }}>
              ค้นหาจุดบริการและวิธีใช้งานที่ถูกต้อง
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* 2. Category Filter - เอา Paper และ Border สีเหลืองออก */}
      <Box sx={{ mt: -2 }}>
        <CategoryFilter
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </Box>

      {/* 3. List Section */}
      <Container maxWidth="sm" sx={{ mt: 3 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress
              size={30}
              thickness={5}
              sx={{ color: "#D32F2F" }}
            />
          </Box>
        ) : (
          <Stack spacing={2}>
            {data?.result.map((item) => (
              <ManualCard
                key={item.id}
                manual={item}
                onOpen={setActiveManual}
              />
            ))}

            {data?.result.length === 0 && (
              <Typography align="center" sx={{ py: 10, color: "#9CA3AF" }}>
                ไม่มีข้อมูลในหมวดหมู่นี้
              </Typography>
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
