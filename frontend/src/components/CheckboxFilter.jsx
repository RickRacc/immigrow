// src/components/CheckboxFilter.jsx
import { Form } from "react-bootstrap";

/**
 * Checkbox-based multi-select filter component
 * @param {string} label - Display label for the filter group
 * @param {Array} options - Array of {value, label} option objects
 * @param {Array} selectedValues - Array of currently selected values
 * @param {Function} onChange - Callback when selection changes
 */
export default function CheckboxFilter({ label, options, selectedValues = [], onChange }) {
  const handleCheckboxChange = (value, checked) => {
    let newValues;
    if (checked) {
      // Add to selection
      newValues = [...selectedValues, value];
    } else {
      // Remove from selection
      newValues = selectedValues.filter(v => v !== value);
    }
    onChange(newValues);
  };

  return (
    <div className="mb-2">
      <Form.Label className="small fw-bold mb-1">{label}</Form.Label>
      <div className="border rounded p-2" style={{ maxHeight: "200px", overflowY: "auto" }}>
        {options.map((opt) => (
          <Form.Check
            key={opt.value}
            type="checkbox"
            id={`${label}-${opt.value}`}
            label={opt.label}
            checked={selectedValues.includes(opt.value)}
            onChange={(e) => handleCheckboxChange(opt.value, e.target.checked)}
            className="small"
          />
        ))}
      </div>
      {selectedValues.length > 0 && (
        <div className="small text-muted mt-1">
          {selectedValues.length} selected
        </div>
      )}
    </div>
  );
}
