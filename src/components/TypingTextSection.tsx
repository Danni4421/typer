import React, { useEffect, useState, useRef } from "react";
import { pub } from "../lib/http";

interface TypingTextSectionProps {
  lang: string;
}

const TypingTextSection: React.FC<
  TypingTextSectionProps & {
    typedWords: string[];
    currentInput: string;
  }
> = ({ lang, typedWords, currentInput }) => {
  const [typingText, setTypingText] = useState<string>("");
  const [loadingText, setLoadingText] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentWordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!lang) return;
    setLoadingText(true);
    pub
      .get<{ data: Array<string> }>(`/languages/${lang}/words/random?limit=300`)
      .then((res) => {
        setTypingText(
          res.data.data.reduce((acc, word) => acc + word + " ", "").trim() || ""
        );
      })
      .catch(() => {
        setTypingText("Failed to load typing text.");
      })
      .finally(() => setLoadingText(false));
  }, [lang]);
  useEffect(() => {
    if (currentWordRef.current && containerRef.current) {
      const currentWord = currentWordRef.current;
      const container = containerRef.current;

      requestAnimationFrame(() => {
        const containerRect = container.getBoundingClientRect();
        const wordRect = currentWord.getBoundingClientRect();

        const lineHeight =
          parseFloat(getComputedStyle(currentWord).lineHeight) || 24;

        const triggerZone = containerRect.bottom - lineHeight * 2;
        const shouldScroll = wordRect.bottom >= triggerZone;
        if (shouldScroll) {
          const currentScrollTop = container.scrollTop;

          const targetScrollTop = currentScrollTop + lineHeight * 3;

          container.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: "smooth",
          });
        }
      });
    }
  }, [typedWords.length]);
  const words = typingText.split(" ").filter(Boolean);
  return (
    <section className="typing-text-container">
      <div className="text-[var(--warp-text-accent)] font-semibold mb-2 text-xs uppercase tracking-wide">
        {lang.toUpperCase()} • Text to type:
      </div>
      {loadingText ? (
        <div className="text-[var(--warp-text-muted)] animate-pulse">
          Loading...
        </div>
      ) : (
        <div
          ref={containerRef}
          data-testid="typing-text"
          className="typing-text text-lg leading-relaxed"
        >
          {words.map((word, idx) => {
            let className = "typing-word";
            const isCurrentWord = idx === typedWords.length;

            if (typedWords[idx]) {
              className += typedWords[idx] === word ? " correct" : " incorrect";
            } else if (isCurrentWord && currentInput.length > 0) {
              className +=
                currentInput === word.slice(0, currentInput.length)
                  ? " current"
                  : " incorrect";
            } else if (isCurrentWord) {
              className += " current";
            }

            return (
              <span
                key={idx}
                ref={isCurrentWord ? currentWordRef : null}
                className={className}
              >
                {word}
              </span>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default TypingTextSection;
