import { create } from "zustand";
import { persist } from "zustand/middleware";

type SettingsState = {
    serverIP: string;
    setServerIp: (serverIp: string) => void;
};

export const useSettingsStore = create(
    persist(
        (set, get) => ({
            serverIP: "localhost:8000",

            setServerIp: (serverIp: string) =>set((state: SettingsState) => ({
                serverIP: serverIp,
            })),
        }),
        { name: "settings-storage" },
    )
);

export const useUserDraggableStore = useSettingsStore;