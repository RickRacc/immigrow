// src/components/MatchIndicator.jsx
import { Badge } from "react-bootstrap";

/**
 * Shows which fields matched the search query
 * @param {Object} item - The data item (event/org/resource)
 * @param {string} searchQuery - The search query
 * @param {Array} fieldsToCheck - Array of {key, label} objects to check
 */
export default function MatchIndicator({ item, searchQuery, fieldsToCheck }) {
  if (!searchQuery || !searchQuery.trim()) return null;

  const query = searchQuery.trim().toLowerCase();
  const matchedFields = [];

  // Split query into individual words for multi-word matching
  const queryWords = query.split(/\s+/).filter(word => word.length > 0);

  fieldsToCheck.forEach(field => {
    const value = item[field.key];
    if (!value) return;

    const valueStr = String(value).toLowerCase();

    // Check if the full query matches (highest priority)
    if (valueStr.includes(query)) {
      matchedFields.push(field.label);
      return;
    }

    // Check if any individual word matches (for multi-word queries)
    const hasWordMatch = queryWords.some(word => valueStr.includes(word));
    if (hasWordMatch) {
      matchedFields.push(field.label);
    }
  });

  if (matchedFields.length === 0) return null;

  return (
    <div className="mt-2">
      <small className="text-muted">
        <i className="bi bi-search me-1"></i>
        Matches: {matchedFields.slice(0, 3).join(", ")}
        {matchedFields.length > 3 && ` +${matchedFields.length - 3} more`}
      </small>
    </div>
  );
}
