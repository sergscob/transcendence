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

            getServerHttpUrl: () => {
                const serverIP = get().serverIP;
                if (!serverIP.startsWith("http://") && !serverIP.startsWith("https://")) {
                    return "http://" + serverIP;
                }
                return serverIP;
            },
            getServerWsUrl: () => {
                const serverIP = get().serverIP;
                if (serverIP.startsWith("http://")) {
                    return "ws://" + serverIP.slice(7);
                } else if (serverIP.startsWith("https://")) {
                    return "wss://" + serverIP.slice(8);
                } 
                return "ws://" + serverIP;
            }
        }),
        { name: "settings-storage" },
    )
);

