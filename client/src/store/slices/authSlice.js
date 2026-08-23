import { createSlice } from '@reduxjs/toolkit';

const initialToken = localStorage.getItem('token') || localStorage.getItem('accessToken') || null;
const initialUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialUser,
    token: initialToken,
    accessToken: initialToken,
    isAuthenticated: !!initialToken,
    loading: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, accessToken, refreshToken } = action.payload;
      const validToken = token || accessToken;

      state.user = user;
      state.token = validToken;
      state.accessToken = validToken;
      state.isAuthenticated = true;

      if (validToken) {
        localStorage.setItem('token', validToken);
        localStorage.setItem('accessToken', validToken);
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.accessToken = null;
      state.isAuthenticated = false;

      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;