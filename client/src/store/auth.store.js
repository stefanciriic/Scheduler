export const authStoreSlice = (set, get) => ({
    token: null,
    user: null,
  
    setToken: (token) => set((state) => {
      state.token = token;
    }),
  
    setUser: (user) => set((state) => {
      state.user = user;
    }),
  
    logout: () => set((state) => {
      state.token = null;
      state.user = null;
    }),
  });
  