import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { authStoreSlice } from "./auth.store";

export const useApplicationStore = create(
  persist(
    immer((...a) => ({
      ...authStoreSlice(...a), 
    })),
    {
      partialize: ({ token, user }) => ({ token, user }), 
      name: "application-store", 
    }
  )
);
