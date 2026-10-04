import { create } from "zustand";

const STORAGE_KEY = "linkup-theme";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem(STORAGE_KEY) || "coffee",
  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    set({ theme });
  },
}));
