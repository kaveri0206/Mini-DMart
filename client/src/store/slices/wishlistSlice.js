import { createSlice } from '@reduxjs/toolkit';

const getStoredWishlist = () => {
  try {
    const raw = localStorage.getItem('dmartx_wishlist');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: getStoredWishlist(),
  },
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const targetId = String(product._id || product.id);
      const existingIdx = state.items.findIndex(
        (item) => String(item._id || item.id) === targetId
      );

      if (existingIdx >= 0) {
        state.items.splice(existingIdx, 1);
      } else {
        state.items.push(product);
      }

      localStorage.setItem('dmartx_wishlist', JSON.stringify(state.items));
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem('dmartx_wishlist');
    },
  },
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;