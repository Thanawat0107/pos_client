import { Font } from '@react-pdf/renderer';

// const path = "http://tee.kru.ac.th/cs66/s07/cnmswep/";
const path = "/";

export const registerPdfFonts = () => {
Font.register({
  family: "Sarabun",
  fonts: [
    {
      src: `${path}fonts/Sarabun-Regular.ttf`,
      fontWeight: "normal",
    },
    {
      src: `${path}fonts/Sarabun-Bold.ttf`,
      fontWeight: "bold",
    },
    {
      src: `${path}fonts/Sarabun-Italic.ttf`,
      fontStyle: "italic",
    },
  ],
});
};