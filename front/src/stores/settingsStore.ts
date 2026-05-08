import { create } from "zustand";
import { persist } from "zustand/middleware";

type LanguagesEnum = "en" | "fr" | "ru";

type SettingsState = {
    serverIP: string;
    language: LanguagesEnum;
    setServerIp: (serverIp: string) => void;
    setLanguage: (language: LanguagesEnum) => void;
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

            getServerWsUrl: () => {
                return ''
            }

        }),
        { name: "trans-settings-storage" },
    )
);

