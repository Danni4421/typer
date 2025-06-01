import React, { useEffect, useState, useRef } from "react";
import { pub } from "../lib/http";

// Fallback text for different languages
const getFallbackText = (lang: string): string => {
  const fallbackTexts: Record<string, string> = {
    english:
      "the quick brown fox jumps over the lazy dog and runs through the forest while the sun shines brightly in the clear blue sky above the mountains",
    spanish:
      "el zorro marrón rápido salta sobre el perro perezoso y corre por el bosque mientras el sol brilla intensamente en el cielo azul claro",
    french:
      "le renard brun rapide saute par-dessus le chien paresseux et court à travers la forêt pendant que le soleil brille dans le ciel",
    german:
      "der schnelle braune fuchs springt über den faulen hund und läuft durch den wald während die sonne hell am himmel scheint",
    italian:
      "la volpe marrone veloce salta sopra il cane pigro e corre attraverso la foresta mentre il sole splende luminoso nel cielo",
    portuguese:
      "a raposa marrom rápida pula sobre o cão preguiçoso e corre pela floresta enquanto o sol brilha no céu azul",
    dutch:
      "de snelle bruine vos springt over de luie hond en rent door het bos terwijl de zon helder schijnt aan de hemel",
    russian:
      "быстрая коричневая лиса прыгает через ленивую собаку и бежит по лесу пока солнце ярко светит в небе",
    chinese: "敏捷的棕色狐狸跳过懒惰的狗并穿过森林当太阳在天空中明亮地照耀着",
    japanese:
      "素早い茶色のキツネが怠惰な犬を飛び越えて森を駆け抜ける間太陽が空で明るく輝いている",
  };

  return fallbackTexts[lang.toLowerCase()] || fallbackTexts.english;
};

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
        const words = res.data?.data;
        if (words && Array.isArray(words) && words.length > 0) {
          setTypingText(
            words.reduce((acc, word) => acc + word + " ", "").trim()
          );
        } else {
          // Fallback text if API doesn't return proper data
          setTypingText(getFallbackText(lang));
        }
      })
      .catch((error) => {
        console.warn("Failed to load typing text from API:", error);
        setTypingText(getFallbackText(lang));
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
