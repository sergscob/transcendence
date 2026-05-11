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
            delWindowPosition: (name) => {
                  set(state => {
                        const p = state.positions
                        delete p[name];
                        // console.log("p=", p)
                        return { positions: {
                              ...p,
                        }
                  }
                  
                  })
            }
      }),
);

export const useUserDraggableStore = useDraggableStore;