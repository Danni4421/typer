import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import TypingTextSection from "./TypingTextSection";
import { useTerminal } from "../hooks/useTerminal";
import type { TerminalInputProps } from "../types";

export default function TerminalInput({ lang: propLang }: TerminalInputProps) {
  const {
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
  } = useTerminal({ lang: propLang });

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Terminal History */}
      <motion.div
        className="terminal-history"
        style={{
          maxHeight: window.location.pathname.startsWith("/typing-test/")
            ? "calc(65vh - 75px)"
            : "calc(95vh - 75px)",
        }}
        layout
      >
        <AnimatePresence mode="popLayout">
          {history.map((cmd, idx) => (
            <motion.div
              key={idx}
              className="command-output"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
                delay: idx * 0.05,
              }}
              layout
            >
              <span
                className="font-mono whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: cmd }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {/* Typing Test Section */}
      <AnimatePresence mode="wait">
        {mode === "typing" && (
          <motion.div
            key="typing-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <TypingTextSection
              lang={typingLang}
              typedWords={typedWords}
              currentInput={input}
            />
          </motion.div>
        )}
      </AnimatePresence>{" "}
      {/* Terminal Input */}
      <motion.div
        className="terminal-input-container"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <form
          className="terminal-input-form"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <motion.span
            className="terminal-prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.3 }}
          >
            {getPrompt()}
          </motion.span>
          <motion.input
            ref={inputRef}
            type="text"
            autoFocus
            autoComplete="off"
            className="terminal-input"
            placeholder={getPlaceholder()}
            spellCheck="false"
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            whileFocus={{ scale: 1.02 }}
          />
        </form>
      </motion.div>
    </motion.div>
  );
}
