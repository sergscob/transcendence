import { create } from "zustand";
import { persist } from "zustand/middleware";

type LanguagesEnum = "en" | "fr" | "ru";

type SettingsState = {
    serverIP: string;
    language: LanguagesEnum;
    setServerIp: (serverIp: string) => void;
    setLanguage: (language: LanguagesEnum) => void;
    getServerHttpUrl: () => string;
    getServerWsUrl: () => string;
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            serverIP: "localhost:8000",
            language: "en",

            setServerIp: (serverIp: string) =>set((state: SettingsState) => ({
                serverIP: serverIp,
            })),

            setLanguage: (language: LanguagesEnum) => set(() => ({
                language,
            })),

            getServerHttpUrl: () => {
                const serverIP = get().serverIP;
                if (serverIP.startsWith("http://") || serverIP.startsWith("https://")) {
                    return serverIP;
                }
                const pageProtocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "https" : "http";
                return `${pageProtocol}://${serverIP}`;
            },
            getServerWsUrl: () => {
                const serverIP = get().serverIP;
                if (serverIP.startsWith("http://")) {
                    return "ws://" + serverIP.slice(7);
                } else if (serverIP.startsWith("https://")) {
                    return "wss://" + serverIP.slice(8);
                }
                const wsProtocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss" : "ws";
                return `${wsProtocol}://${serverIP}`;
            }
        }),
        { name: "trans-settings-storage" },
    )
);

