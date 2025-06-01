import { useState, useEffect, useRef } from "react";
import { useTerminalStore } from "../stores/terminalStore";
import {
  getPageMode,
  extractLanguageFromUrl,
  createShortcutHandler,
  createLocationChangeHandler,
  setupHistoryPatching,
} from "../lib/terminalUtils";
import { executeCommand, getTabCompletion } from "../lib/commands";
import { typingUtils, inputUtils } from "../lib/inputUtils";
import type { TerminalMode, TerminalInputProps } from "../types";

export const useTerminal = ({ lang: propLang }: TerminalInputProps = {}) => {
  // State
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<TerminalMode | null>(null);
  const [typedWords, setTypedWords] = useState<string[]>([]);
  const [typingLang, setTypingLang] = useState<string>("");

  // Refs
  const inputRef = useRef<HTMLInputElement>(
    null
  ) as React.RefObject<HTMLInputElement>;

  // Store
  const history = useTerminalStore((state) => state.history);
  const addHistory = useTerminalStore((state) => state.addHistory);
  const clearHistory = useTerminalStore((state) => state.clearHistory);
  // Initialize mode and language
  useEffect(() => {
    const modeNow = getPageMode();
    console.log(
      "🔄 Mode detected:",
      modeNow,
      "Current path:",
      window.location?.pathname
    );
    setMode(modeNow);

    if (modeNow === "typing") {
      const lang = propLang || extractLanguageFromUrl();
      setTypingLang(lang);
      typingUtils.resetTypingState(setTypedWords);
    } else {
      setTypingLang("");
      typingUtils.resetTypingState(setTypedWords);
    }

    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Setup location change handling
    const onLocationChange = createLocationChangeHandler(setMode, inputRef);
    const cleanup = setupHistoryPatching(onLocationChange);

    return cleanup;
  }, [propLang]);

  // Setup keyboard shortcuts
  useEffect(() => {
    const handleShortcut = createShortcutHandler(
      mode,
      setMode,
      setInput,
      inputRef
    );
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [mode]);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === "") return;

    if (mode === "terminal") {
      executeCommand(input, addHistory);
      setInput("");
      return;
    }

    if (mode === "typing" && inputUtils.isCommand(input)) {
      executeCommand(input, addHistory);
      setInput("");
    } else if (mode === "typing") {
      typingUtils.submitInput(input, setTypedWords, setInput);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Tab completion
    if (e.key === "Tab") {
      e.preventDefault();
      if (mode === "terminal" && input.trim() !== "") {
        const completion = getTabCompletion(input);
        if (typeof completion === "string") {
          setInput(completion);
        } else if (Array.isArray(completion)) {
          addHistory(`Possible commands: ${completion.join(", ")}`);
        }
      }
    }

    // Space submission in typing mode
    if (mode === "typing" && e.key === " " && input.trim() !== "") {
      e.preventDefault();
      typingUtils.submitWord(input, setTypedWords, setInput);
    }

    // Backspace undo in typing mode
    if (mode === "typing" && e.key === "Backspace") {
      if (
        typingUtils.undoLastWord(input, typedWords, setTypedWords, setInput)
      ) {
        e.preventDefault();
      }
    }
  };

  const getPlaceholder = () => {
    return inputUtils.getPlaceholder(mode, input, typedWords);
  };

  const getPrompt = () => {
    return mode === "typing" ? window.location.pathname : "$";
  };

  return {
    // State
    input,
    mode,
    typedWords,
    typingLang,
    history,

    // Refs
    inputRef,

    // Handlers
    handleChange,
    handleSubmit,
    handleKeyDown,

    // Utilities
    getPlaceholder,
    getPrompt,
  };
};
