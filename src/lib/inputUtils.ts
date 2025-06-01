// Typing mode utilities
export const typingUtils = {
  // Handle word submission
  submitWord: (
    input: string,
    setTypedWords: React.Dispatch<React.SetStateAction<string[]>>,
    setInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const parts = input.split(/\s+/);
    const [first, ...rest] = parts;
    setTypedWords((prev) => [...prev, first]);
    setInput(rest.join(" "));
  },

  // Handle backspace undo
  undoLastWord: (
    input: string,
    typedWords: string[],
    setTypedWords: React.Dispatch<React.SetStateAction<string[]>>,
    setInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (input === "" && typedWords.length > 0) {
      setInput(typedWords[typedWords.length - 1] + (input ? " " + input : ""));
      setTypedWords((prev) => prev.slice(0, -1));
      return true;
    }
    return false;
  },

  // Handle full input submission
  submitInput: (
    input: string,
    setTypedWords: React.Dispatch<React.SetStateAction<string[]>>,
    setInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setTypedWords((prev) => [...prev, input.trim()]);
    setInput("");
  },

  // Reset typing state
  resetTypingState: (
    setTypedWords: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setTypedWords([]);
  },
};

// Input validation utilities
export const inputUtils = {
  // Check if input is a command
  isCommand: (input: string): boolean => {
    return input.startsWith("cd ");
  },

  // Get placeholder text based on mode and state
  getPlaceholder: (
    mode: string | null,
    input: string,
    typedWords: string[]
  ): string => {
    if (mode === "typing") {
      return input === "" && typedWords.length === 0
        ? "Type here... (Ctrl+/ to switch to terminal mode)"
        : "Type the text here...";
    } else if (mode === "terminal") {
      return "Type a command... (e.g. cd /typing-test/en)";
    }
    return "";
  },
};
