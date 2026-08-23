import { createSlice } from '@reduxjs/toolkit';

const initialCart = JSON.parse(localStorage.getItem('dmartx_cart')) || [];

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: initialCart,
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find((i) => i.product._id === product._id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ product, quantity });
      }
      localStorage.setItem('dmartx_cart', JSON.stringify(state.items));
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.product._id !== productId);
      } else {
        const item = state.items.find((i) => i.product._id === productId);
        if (item) item.quantity = quantity;
      }
      localStorage.setItem('dmartx_cart', JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('dmartx_cart');
    },
  },
});

export const { addToCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;