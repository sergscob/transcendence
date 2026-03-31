import { create } from "zustand";
import { persist } from "zustand/middleware";
// import { fetchCurrentUser } from "../api/userApi";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      loaded: false,
      
      loadUser: async () => {
        const { loaded, loading } = get();
        if (loaded || loading) 
          return;

        set({ loading: true });
        const res = await API.get("profile/");
        set({ user: res.data, loading: false, loaded: true });
      },

      // login: async (credentials) => {
      //   set({ loading: true });
      //   API.get("profile/").then(res => setUser(res.data)),

      //   // const user = await fetchCurrentUser(credentials);
      //   set({ user, loading: false });
      // },

      // logout: () => set({ user: null }),
      
      // isAuth: () => !!get().user,
    //
    }),
    
    { name: "user-storage" }
  )
);