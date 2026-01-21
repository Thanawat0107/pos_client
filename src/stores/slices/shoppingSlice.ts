import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { shoppingCartApi } from "../../services/shoppingCartApi";
import type { Cart } from "../../@types/dto/Cart";
import type { CartItemDto } from "../../@types/dto/CartItemDto";

interface ShoppingCartState {
  cartToken: string | null;
  cartItems: CartItemDto[];
  totalAmount: number;
  totalItemsCount: number;
}

const initialState: ShoppingCartState = {
  cartToken: localStorage.getItem("cartToken") || null,
  cartItems: [],
  totalAmount: 0,
  totalItemsCount: 0,
};

// 🧮 Helper: ฟังก์ชันคำนวณยอดรวม (ใช้สูตรเดียวกับ Backend)
const calculateTotals = (items: CartItemDto[]) => {
  let amount = 0;
  let count = 0;

  items.forEach((item) => {
    // Backend: (UnitPrice + ExtraPrice) * Quantity
    // Frontend: item.price คือ (UnitPrice + ExtraPrice) ที่ Backend ส่งมาให้แล้ว
    amount += item.price * item.quantity;
    count += item.quantity;
  });

  return {
    totalAmount: amount,
    totalItemsCount: count,
  };
};

export const shoppingSlice = createSlice({
  name: "shoppingCart",
  initialState,
  reducers: {
    setCartToken: (state, action: PayloadAction<string>) => {
      state.cartToken = action.payload;
      localStorage.setItem("cartToken", action.payload);
    },
    
    clearLocalCart: (state) => {
      state.cartToken = null;
      state.cartItems = [];
      state.totalAmount = 0;
      state.totalItemsCount = 0;
      localStorage.removeItem("cartToken");
    },

    setCartData: (state, action: PayloadAction<Cart>) => {
      state.cartItems = action.payload.cartItems;
      state.totalAmount = action.payload.totalAmount;
      state.totalItemsCount = action.payload.totalItemsCount;
    },

    // ✅ CRUD 1: อัปเดตจำนวน/Note (Optimistic Update)
    updateItemLocal: (
      state,
      action: PayloadAction<{ id: number; qty: number; note?: string }>
    ) => {
      const item = state.cartItems.find((x) => x.id === action.payload.id);
      if (item) {
        // 1. อัปเดตค่า
        item.quantity = action.payload.qty;
        if (action.payload.note !== undefined) {
          item.note = action.payload.note;
        }

        // 2. คำนวณยอดรวมใหม่ทันที!
        const totals = calculateTotals(state.cartItems);
        state.totalAmount = totals.totalAmount;
        state.totalItemsCount = totals.totalItemsCount;
      }
    },

    // ✅ CRUD 2: ลบสินค้า (Optimistic Delete)
    removeItemLocal: (state, action: PayloadAction<number>) => {
      // 1. ลบออกจาก Array
      state.cartItems = state.cartItems.filter((x) => x.id !== action.payload);

      // 2. คำนวณยอดรวมใหม่ทันที!
      const totals = calculateTotals(state.cartItems);
      state.totalAmount = totals.totalAmount;
      state.totalItemsCount = totals.totalItemsCount;
    },
  },

  // ✅ Auto Sync: เมื่อ API ตอบกลับ จะเอาข้อมูลจริงจาก Server มาทับ Local (เพื่อความชัวร์ 100%)
  extraReducers: (builder) => {
    builder.addMatcher(
      shoppingCartApi.endpoints.addtoCart.matchFulfilled,
      (state, { payload }) => {
        state.cartToken = payload.cartToken;
        state.cartItems = payload.cartItems;
        state.totalAmount = payload.totalAmount;
        state.totalItemsCount = payload.totalItemsCount;
        if (payload.cartToken) localStorage.setItem("cartToken", payload.cartToken);
      }
    );

    builder.addMatcher(
      shoppingCartApi.endpoints.getCart.matchFulfilled,
      (state, { payload }) => {
        if (payload) {
          state.cartToken = payload.cartToken;
          state.cartItems = payload.cartItems;
          state.totalAmount = payload.totalAmount;
          state.totalItemsCount = payload.totalItemsCount;
        }
      }
    );

    builder.addMatcher(
      shoppingCartApi.endpoints.clearCart.matchFulfilled,
      (state) => {
        state.cartItems = [];
        state.totalAmount = 0;
        state.totalItemsCount = 0;
      }
    );
  },
});

export const {
  setCartToken,
  clearLocalCart,
  setCartData,
  updateItemLocal,
  removeItemLocal,
} = shoppingSlice.actions;

export default shoppingSlice.reducer;