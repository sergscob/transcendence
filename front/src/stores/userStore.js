import { create } from "zustand";
import { toast } from 'react-toastify'
import API from "../api/api";

export const useUserStore = create((set, get) => ({
      user: null,
      loading: false,
      loaded: false,
      
      loadUser: async (force = false) => {
        const { loaded, loading } = get();
        // console.log("loadUser called", { loaded, loading, force, user: get().user });
        if (!force && (loaded || loading)) 
          return;

        set({ loading: true });
        try {
          const res = await API.get("profile/");
          set({ user: res.data, loading: false, loaded: true });
        } catch (error) {
          set({ loading: false });
          toast.error("Failed to load user profile.");
        }
      },
      setUser: (user) => set({ user }),
      resetUser: () => set({ user: null, loading: false, loaded: false }),
 }));