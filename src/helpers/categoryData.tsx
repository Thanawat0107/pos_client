import { 
  AllInclusive, 
  Restaurant, 
  LocalDrink, 
  CleaningServices, 
  Info 
} from "@mui/icons-material";

export const CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด', icon: <AllInclusive fontSize="large" /> },
  { id: 'cutlery', label: 'ช้อนส้อม/จาน', icon: <Restaurant fontSize="large" /> },
  { id: 'drink', label: 'จุดบริการน้ำ', icon: <LocalDrink fontSize="large" /> },
  { id: 'clean', label: 'ทิชชู่/ถังขยะ', icon: <CleaningServices fontSize="large" /> },
  { id: 'other', label: 'อื่นๆ', icon: <Info fontSize="large" /> },
];