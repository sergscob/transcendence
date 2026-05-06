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

            // getServerHttpUrl: () => {
            //     console.log("Getting server HTTP URL", import.meta.env.VITE_USE_HTTPS);
            //     const serverIP = get().serverIP;
            //     if (serverIP.startsWith("http://") || serverIP.startsWith("https://")) {
            //         return serverIP;
            //     }
            //     let pageProtocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "https" : "http";
            //     console.log(pageProtocol)
            //     pageProtocol = 'https:'
            //     // return `${pageProtocol}://${pageProtocol === 'https' ? get().htppsServerIP : serverIP}`;
            //     return "https://localhost:8000"
            // },
            // getServerWsUrl: () => {
            //     const serverIP = get().serverIP;
            //     if (serverIP.startsWith("http://")) {
            //         return "ws://" + serverIP.slice(7);
            //     } else if (serverIP.startsWith("https://")) {
            //         return "wss://" + serverIP.slice(8);
            //     }
            //     const wsProtocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss" : "ws";
            //     return 'wss://localhost:8000'
            //     return `${wsProtocol}://${wsProtocol === 'wss' ? get().htppsServerIP : serverIP}`;
            // }
            getServerHttpUrl: () => {
                const serverIP = get().serverIP;
                console.log("Getting server HTTP URL", import.meta.env.VITE_USE_HTTPS, import.meta.env.VITE_USE_HTTPS ? `https://${serverIP}` : `https://${serverIP}`);
                return import.meta.env.VITE_USE_HTTPS ? `https://${serverIP}` : `https://${serverIP}`
            },
            getServerWsUrl: () => {
                const serverIP = get().serverIP;
                return import.meta.env.VITE_USE_HTTPS ? `wss://${serverIP}` : `ws://${serverIP}`
            }

        }),
        { name: "trans-settings-storage" },
    )
);

