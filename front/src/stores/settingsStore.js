import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSettingsStore = create(
    persist(
        (set, get) => ({
            serverIP: "localhost",

            setServerIp: (serverIp) =>set((state) => ({
                serverIP: serverIp,
            })),
        }),
        { name: "settings-storage" },
    )
);

export const useUserDraggableStore = useSettingsStore;