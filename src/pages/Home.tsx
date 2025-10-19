import { useState } from "react";
import Carousel from "../components/layouts/Carousel";
import CategoryScroller, {
  demoCategories,
} from "../components/pages/home/category/CategoryScroller";
import { Typography, Box } from "@mui/material";
import MenuScroller from "../components/pages/home/menu/MenuScroller";
import type { Menu } from "../components/pages/home/menu/MenuCard";

const items: Menu[] = [
  {
    id: "airpods",
    name: "Apple AirPods",
    price: 95,
    image:
      "https://images.unsplash.com/photo-1518446060624-3c3101a6c29b?q=80&w=1200&auto=format&fit=crop",
    description:
      "With plenty of talk and listen time, voice-activated Siri, and wireless charging.",
  },
  {
    id: "watch",
    name: "Smart Watch",
    price: 129,
    image:
      "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=1200&auto=format&fit=crop",
    description: "Health tracking, notifications, and long battery life.",
  },
  {
    id: "watch",
    name: "Smart Watch",
    price: 129,
    image:
      "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=1200&auto=format&fit=crop",
    description: "Health tracking, notifications, and long battery life.",
  },{
    id: "watch",
    name: "Smart Watch",
    price: 129,
    image:
      "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=1200&auto=format&fit=crop",
    description: "Health tracking, notifications, and long battery life.",
  },{
    id: "watch",
    name: "Smart Watch",
    price: 129,
    image:
      "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=1200&auto=format&fit=crop",
    description: "Health tracking, notifications, and long battery life.",
  },{
    id: "watch",
    name: "Smart Watch",
    price: 129,
    image:
      "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=1200&auto=format&fit=crop",
    description: "Health tracking, notifications, and long battery life.",
  },{
    id: "watch",
    name: "Smart Watch",
    price: 129,
    image:
      "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=1200&auto=format&fit=crop",
    description: "Health tracking, notifications, and long battery life.",
  },
];

export default function Home() {
  const [cat, setCat] = useState<string>("pizza");
  return (
    <>
      <div style={{ margin: "10px" }}>
        <Carousel />
      </div>
      
      <CategoryScroller
        items={demoCategories}
        value={cat}
        onChange={setCat}
        maxWidth="xl" // ปรับความกว้างได้: "sm" | "md" | "lg" | "xl" | false
      />

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h6">Selected: {cat}</Typography>
      </Box>

      <MenuScroller
        items={items}
        currency="THB"
        onAddToCart={(p) => console.log("add", p)}
        maxWidth="xl"
      />
    </>
  );
}
