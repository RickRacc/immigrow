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

  fieldsToCheck.forEach(field => {
    const value = item[field.key];
    if (value && String(value).toLowerCase().includes(query)) {
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
