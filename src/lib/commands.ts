import { useTerminalStore } from "../stores/terminalStore";

export type CommandExec = (
  args: string[],
  addHistory: (entry: string) => void
) => void;

export interface Command {
  description: string;
  exec: CommandExec;
}

export type CommandPool = Record<string, Command>;

// Navigation utilities
export const navigationUtils = {
  validateAndNavigate: async (
    path: string,
    addHistory: (entry: string) => void
  ) => {
    try {
      const response = await fetch(path, { method: "HEAD" });
      if (response.ok || response.status === 200) {
        window.location.assign(path);
      } else {
        addHistory(
          `<span style="color: var(--warp-error);">cd: ${path}: No such file or directory</span>`
        );
      }
    } catch (error) {
      addHistory(
        `<span style="color: var(--warp-error);">cd: ${path}: No such file or directory</span>`
      );
    }
  },

  goBack: (addHistory: (entry: string) => void) => {
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      if (currentPath.startsWith("/typing-test/")) {
        window.location.assign("/");
      } else if (currentPath !== "/") {
        const pathParts = currentPath.split("/").filter(Boolean);
        pathParts.pop();
        const parentPath = "/" + pathParts.join("/");
        window.location.assign(parentPath || "/");
      } else {
        addHistory(
          '<span style="color: var(--warp-text-muted);">Already at root directory</span>'
        );
      }
    }
  },
};

// Command implementations
export const commands: CommandPool = {
  cd: {
    description:
      "Navigate to another page. Usage: cd /path or cd .. to go back",
    exec: (args, addHistory) => {
      addHistory(`$ cd ${args.join(" ")}`);

      if (!args[0]) {
        addHistory(
          '<span style="color: var(--warp-error);">cd: missing operand</span>'
        );
        return;
      }

      if (args[0] === "..") {
        navigationUtils.goBack(addHistory);
      } else {
        navigationUtils.validateAndNavigate(args[0], addHistory);
      }
    },
  },

  help: {
    description: "Show available commands",
    exec: (args, addHistory) => {
      const helpOutput = `$ help

╭─ Available Commands ─────────────────────────────╮
│  cd <path>     Navigate to another page          │
│  cd ..         Go back to previous/parent page   │
│                Example: cd /typing-test/en       │
│  help          Show this help message            │
│  echo <text>   Echo the provided text            │
│  clear         Clear terminal history            │
╰──────────────────────────────────────────────────╯

💡 Shortcuts: Ctrl+/ (terminal) • Ctrl+K (typing) • Ctrl+I (focus)`;

      addHistory(helpOutput);
    },
  },

  echo: {
    description: "Echo input text. Usage: echo hello",
    exec: (args, addHistory) => {
      addHistory(`$ echo ${args.join(" ")}`);
      addHistory(args.join(" "));
    },
  },

  clear: {
    description: "Clear terminal history",
    exec: (args, addHistory) => {
      addHistory(`$ clear`);
      setTimeout(() => {
        const clearHistory = useTerminalStore.getState().clearHistory;
        clearHistory();
      }, 100);
    },
  },
};

// Command execution utility
export const executeCommand = (
  input: string,
  addHistory: (entry: string) => void
) => {
  const [cmd, ...args] = input.trim().split(" ");

  if (commands[cmd]) {
    commands[cmd].exec(args, addHistory);
  } else {
    addHistory(`$ ${input}\nCommand not found: ${cmd}`);
  }
};

// Tab completion utility
export const getTabCompletion = (input: string): string | string[] => {
  const [cmd, ...args] = input.trim().split(" ");
  const matches = Object.keys(commands).filter((c) => c.startsWith(cmd));

  if (matches.length === 1) {
    return matches[0] + (args.length ? " " + args.join(" ") : " ");
  } else if (matches.length > 1) {
    return matches;
  }

  return input;
};
