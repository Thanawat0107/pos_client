import type { Menu } from "../components/pages/menu/MenuCard";
import MenuList from "../components/pages/menu/MenuList";

const mock: Menu[] = [
  {
    id: "1",
    name: "กะเพราไก่ไข่ดาว",
    price: 55,
    image: "/img/krapao.jpg",
    description: "เผ็ดกลาง",
  },
  { id: "2", name: "ผัดไทยกุ้ง", price: 75, image: "/img/padthai.jpg" },
  {
    id: "3",
    name: "กะเพราไก่ไข่ดาว",
    price: 55,
    image: "/img/krapao.jpg",
    description: "เผ็ดกลาง",
  },
  {
    id: "4",
    name: "กะเพราไก่ไข่ดาว",
    price: 55,
    image: "/img/krapao.jpg",
    description: "เผ็ดกลาง",
  }
];

export default function MenuItem() {
  const handleAdd = (m: Menu) => {
    // ยิงไป cart / Redux / Zustand ตาม stack นายเลย
    console.log("add to cart:", m);
  };

  return (
    <>
      <MenuList items={mock} onAddToCart={handleAdd} currency="THB" />;{" "}
    </>
  );
}
