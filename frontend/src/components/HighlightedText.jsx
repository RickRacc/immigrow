// src/components/HighlightedText.jsx
import { useMemo } from "react";

/**
 * Component to highlight search matches in text
 * @param {string} text - The text to display
 * @param {string} searchQuery - The search query to highlight
 */
export default function HighlightedText({ text, searchQuery }) {
  const highlightedContent = useMemo(() => {
    if (!text) return "";
    if (!searchQuery || searchQuery.trim() === "") return text;

    const query = searchQuery.trim();

    // Try to find exact phrase match first
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return (
          <mark key={index} className="bg-warning">
            {part}
          </mark>
        );
      }
      return part;
    });
  }, [text, searchQuery]);

  return <>{highlightedContent}</>;
}
