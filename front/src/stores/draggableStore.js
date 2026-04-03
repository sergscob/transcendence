import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useDraggableStore = create(
      (set, get) => ({
            positions: {},

            getWindowPosition: (name, fallbackPosition = { x: 0, y: 0 }) => {
                  return get().positions[name] ?? fallbackPosition;
            },

            setWindowPosition: (name, position) =>
                  set((state) => ({
                        positions: {
                              ...state.positions,
                              [name]: position,
                        },
                  })),
            delWindowPosition: (name) =>
                  set((state) => ({
                        positions: {
                              ...state.positions,
                              [name]: undefined,
                        },
                  })),
      }),
);

export const useUserDraggableStore = useDraggableStore;