import { useState } from "react";
import { Box, IconButton, Fade } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";

const images = [
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7",
];

export default function Carousel() {
  const [index, setIndex] = useState(0);

  const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: 580,
        margin: "auto",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}
    >
      {images.map((img, i) => (
        <Fade key={i} in={i === index} timeout={600}>
          <Box
            component="img"
            src={img}
            alt={`slide-${i}`}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: i === index ? "block" : "none",
            }}
          />
        </Fade>
      ))}

      {/* ปุ่มซ้าย */}
      <IconButton
        onClick={handlePrev}
        sx={{
          position: "absolute",
          top: "50%",
          left: 10,
          transform: "translateY(-50%)",
          color: "white",
          bgcolor: "rgba(0,0,0,0.3)",
          "&:hover": { bgcolor: "rgba(0,0,0,0.5)" },
        }}
      >
        <ArrowBackIos />
      </IconButton>

      {/* ปุ่มขวา */}
      <IconButton
        onClick={handleNext}
        sx={{
          position: "absolute",
          top: "50%",
          right: 10,
          transform: "translateY(-50%)",
          color: "white",
          bgcolor: "rgba(0,0,0,0.3)",
          "&:hover": { bgcolor: "rgba(0,0,0,0.5)" },
        }}
      >
        <ArrowForwardIos />
      </IconButton>

      {/* จุดแสดงตำแหน่ง */}
      <Box
        sx={{
          position: "absolute",
          bottom: 15,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          gap: 1,
        }}
      >
        {images.map((_, i) => (
          <Box
            key={i}
            onClick={() => setIndex(i)}
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: i === index ? "white" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              transition: "0.3s",
            }}
          />
        ))}
      </Box>
    </Box>

  )
}
