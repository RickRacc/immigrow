// src/components/SearchAndFilters.jsx
import { useState, useEffect } from "react";
import { Form, Row, Col, Button, InputGroup } from "react-bootstrap";

/**
 * Reusable Search and Filters component
 *
 * @param {Object} props
 * @param {Function} props.onApply - Callback when "Apply Filters" is clicked
 * @param {Array} props.sortOptions - Array of {value, label} objects for sort dropdown
 * @param {Array} props.filterFields - Array of filter field configs
 * @param {string} props.searchPlaceholder - Placeholder for search input
 * @param {Object} props.initialValues - Initial values for search/sort/filter
 */
export default function SearchAndFilters({
  onApply,
  sortOptions = [],
  filterFields = [],
  searchPlaceholder = "Search...",
  initialValues = {}
}) {
  const [searchInput, setSearchInput] = useState(initialValues.search || "");
  const [sortBy, setSortBy] = useState(initialValues.sortBy || "");
  const [sortOrder, setSortOrder] = useState(initialValues.sortOrder || "asc");
  const [filters, setFilters] = useState(initialValues.filters || {});

  // Update state when initialValues change (for clear all functionality)
  useEffect(() => {
    setSearchInput(initialValues.search || "");
    setSortBy(initialValues.sortBy || "");
    setSortOrder(initialValues.sortOrder || "asc");
    setFilters(initialValues.filters || {});
  }, [initialValues]);

  const handleFilterChange = (filterName, value) => {
    setFilters({ ...filters, [filterName]: value });
  };

  const handleApply = () => {
    onApply({
      search: searchInput,
      sortBy,
      sortOrder,
      filters
    });
  };

  const handleClearAll = () => {
    setSearchInput("");
    setSortBy("");
    setSortOrder("asc");
    setFilters({});
    onApply({
      search: "",
      sortBy: "",
      sortOrder: "asc",
      filters: {}
    });
  };

  return (
    <div className="mb-4 p-3 bg-light rounded">
      {/* Search Bar */}
      <Form className="mb-3" onSubmit={(e) => e.preventDefault()}>
        <InputGroup>
          <Form.Control
            type="text"
            placeholder={searchPlaceholder}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApply();
              }
            }}
          />
        </InputGroup>
      </Form>

      <Row className="g-2 mb-3">
        {/* Sort Controls */}
        {sortOptions.length > 0 && (
          <Col md={6} lg={3}>
            <Form.Label className="small fw-bold mb-1">Sort By</Form.Label>
            <Form.Select
              size="sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="">-- None --</option>
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
          </Col>
        )}

        {/* Sort Order */}
        {sortOptions.length > 0 && (
          <Col md={6} lg={3}>
            <Form.Label className="small fw-bold mb-1">Sort Order</Form.Label>
            <Form.Select
              size="sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              disabled={!sortBy}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </Form.Select>
          </Col>
        )}

        {/* Filter Fields */}
        {filterFields.map((field) => (
          <Col md={6} lg={3} key={field.name}>
            <Form.Label className="small fw-bold mb-1">{field.label}</Form.Label>
            <Form.Select
              size="sm"
              value={filters[field.name] || ""}
              onChange={(e) => handleFilterChange(field.name, e.target.value)}
            >
              <option value="">-- All --</option>
              {field.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Form.Select>
          </Col>
        ))}
      </Row>

      {/* Action Buttons */}
      <Row>
        <Col>
          <div className="d-flex gap-2">
            <Button size="sm" variant="primary" onClick={handleApply}>
              <i className="bi bi-funnel me-1"></i>
              Apply Filters
            </Button>
            <Button size="sm" variant="outline-secondary" onClick={handleClearAll}>
              <i className="bi bi-x-circle me-1"></i>
              Clear All
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}
