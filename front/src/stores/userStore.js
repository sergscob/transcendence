import { create } from "zustand";
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
        const res = await API.get("profile/");
        set({ user: res.data, loading: false, loaded: true });
      },
 }));