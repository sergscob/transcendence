import { create } from "zustand";
import { persist } from "zustand/middleware";


type GameState = {
    match_id: string;
    setMatchId: (matchId: string) => void;
    // setLanguage: (language: LanguagesEnum) => void;
    // getServerHttpUrl: () => string;
    // getServerWsUrl: () => string;
};

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            match_id: "",
            setMatchId: (matchId: string) => set({ match_id: matchId }),
        }),
        { name: "trans-game-storage" },
    )
);

