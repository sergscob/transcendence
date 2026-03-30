import { create } from "zustand";
import { persist } from "zustand/middleware";
// import { fetchCurrentUser } from "../api/userApi";

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      
      login: async (credentials) => {
        set({ loading: true });

        // const user = await fetchCurrentUser(credentials);
        set({ user, loading: false });
      },

      logout: () => set({ user: null }),
      
      isAuth: () => !!get().user,
    }),
    { name: "auth-storage" }
  )
);