import type { Dispatch, SetStateAction } from "react";
import type { TerminalMode } from "../types";

// Terminal mode detection
export const getPageMode = (): "typing" | "terminal" => {
  if (typeof window !== "undefined") {
    return window.location.pathname.startsWith("/typing-test/")
      ? "typing"
      : "terminal";
  }
  return "terminal";
};

// Extract language from URL
export const extractLanguageFromUrl = (): string => {
  if (typeof window !== "undefined") {
    return window.location.pathname.split("/typing-test/")[1] || "";
  }
  return "";
};

// Keyboard shortcut handlers
export const createShortcutHandler = (
  mode: string | null,
  setMode: Dispatch<SetStateAction<TerminalMode | null>>,
  setInput: (input: string) => void,
  inputRef: React.RefObject<HTMLInputElement>
) => {
  return (e: KeyboardEvent) => {
    // Ctrl+/ - Switch to terminal mode
    if (mode === "typing" && e.ctrlKey && e.key.toLowerCase() === "/") {
      setMode("terminal");
      setInput("");
    }

    // Ctrl+K - Switch to typing mode
    if (mode === "terminal" && e.ctrlKey && e.key.toLowerCase() === "k") {
      setMode("typing");
      setInput("");
    }

    // Ctrl+I - Focus input
    if (e.ctrlKey && e.key.toLowerCase() === "i") {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };
};

// Location change handler
export const createLocationChangeHandler = (
  setMode: Dispatch<SetStateAction<TerminalMode | null>>,
  inputRef: React.RefObject<HTMLInputElement>
) => {
  return () => {
    setMode(getPageMode());
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 10);
  };
};

// Setup browser history patching
export const setupHistoryPatching = (onLocationChange: () => void) => {
  const origPushState = window.history.pushState;
  const origReplaceState = window.history.replaceState;

  window.history.pushState = function (...args) {
    origPushState.apply(this, args);
    window.dispatchEvent(new Event("pushstate"));
    window.dispatchEvent(new Event("locationchange"));
  };

  window.history.replaceState = function (...args) {
    origReplaceState.apply(this, args);
    window.dispatchEvent(new Event("replacestate"));
    window.dispatchEvent(new Event("locationchange"));
  };

  // Add event listeners
  window.addEventListener("popstate", onLocationChange);
  window.addEventListener("pushstate", onLocationChange);
  window.addEventListener("replacestate", onLocationChange);
  window.addEventListener("locationchange", onLocationChange);

  // Return cleanup function
  return () => {
    window.removeEventListener("popstate", onLocationChange);
    window.removeEventListener("pushstate", onLocationChange);
    window.removeEventListener("replacestate", onLocationChange);
    window.removeEventListener("locationchange", onLocationChange);
    window.history.pushState = origPushState;
    window.history.replaceState = origReplaceState;
  };
};
