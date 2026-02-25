import { keyframes } from "@mui/material/styles";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import NewspaperOutlinedIcon from "@mui/icons-material/NewspaperOutlined";
import { ContentType } from "../../../../@types/Enum";

// ─── Animation ────────────────────────────────────────────────────────────────
export const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── Image helper — re-export จาก helpers/imageHelper ────────────────────────
export { getImage } from "../../../../helpers/imageHelper";

// ─── Type config ──────────────────────────────────────────────────────────────
export function getTypeConfig(contentType: string) {
  switch (contentType) {
    case ContentType.EVENT:
      return {
        label: "กิจกรรม",
        icon: <EmojiEventsOutlinedIcon sx={{ fontSize: 13 }} />,
        color: "#FF7043",
        bg: "#FFF3E0",
      };
    case ContentType.PROMOTION:
      return {
        label: "โปรโมชั่น",
        icon: <LocalOfferOutlinedIcon sx={{ fontSize: 13 }} />,
        color: "#8E24AA",
        bg: "#F3E5F5",
      };
    default:
      return {
        label: "ข่าวสาร",
        icon: <NewspaperOutlinedIcon sx={{ fontSize: 13 }} />,
        color: "#1E88E5",
        bg: "#E3F2FD",
      };
  }
}
