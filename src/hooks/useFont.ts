import { Font } from '@react-pdf/renderer';

export const registerPdfFonts = () => {
Font.register({
  family: "Sarabun",
  fonts: [
    {
      src: "/fonts/Sarabun-Regular.ttf",
      fontWeight: "normal",
    },
    {
      src: "/fonts/Sarabun-Bold.ttf",
      fontWeight: "bold",
    },
    {
      src: "/fonts/Sarabun-Italic.ttf",
      fontStyle: "italic",
    },
  ],
});
};