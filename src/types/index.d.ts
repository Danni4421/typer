export interface Language {
  id: number;
  code: string;
  name: string;
}

// Terminal types
export type TerminalMode = "typing" | "terminal";

export interface TerminalState {
  mode: TerminalMode | null;
  input: string;
  typedWords: string[];
  typingLang: string;
}

export interface TerminalInputProps {
  lang?: string;
}
