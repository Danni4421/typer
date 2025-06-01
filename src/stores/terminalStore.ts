import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TerminalState {
  history: string[];
  addHistory: (entry: string) => void;
  clearHistory: () => void;
}

const WELCOME_TEXT = `╭─────────────────────────────────────────────────────╮
│  ████████╗██╗   ██╗██████╗ ███████╗██████╗           │
│  ╚══██╔══╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗          │
│     ██║    ╚████╔╝ ██████╔╝█████╗  ██████╔╝          │
│     ██║     ╚██╔╝  ██╔═══╝ ██╔══╝  ██╔══██╗          │
│     ██║      ██║   ██║     ███████╗██║  ██║          │
│     ╚═╝      ╚═╝   ╚═╝     ╚══════╝╚═╝  ╚═╝          │
│                                                       │
│  Welcome to Typer Terminal! 🚀                       │
│  Quick start: type 'help' or 'cd /typing-test/en'    │
╰─────────────────────────────────────────────────────╯`;

export const useTerminalStore = create<TerminalState>()(
  persist(
    (set) => ({
      history: [WELCOME_TEXT],
      addHistory: (entry) =>
        set((state) => ({ history: [...state.history, entry] })),
      clearHistory: () => set({ history: [WELCOME_TEXT] }),
    }),
    {
      name: "terminal-history",
    }
  )
);
