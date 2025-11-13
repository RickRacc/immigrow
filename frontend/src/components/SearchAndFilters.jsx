// src/components/SearchAndFilters.jsx
import { useState } from "react";
import { Form, Row, Col, Button, InputGroup } from "react-bootstrap";

/**
 * Reusable Search and Filters component
 *
 * @param {Object} props
 * @param {Function} props.onSearch - Callback when search is triggered
 * @param {Function} props.onSortChange - Callback when sort changes
 * @param {Function} props.onFilterChange - Callback when filters change
 * @param {Array} props.sortOptions - Array of {value, label} objects for sort dropdown
 * @param {Array} props.filterFields - Array of filter field configs
 * @param {string} props.searchPlaceholder - Placeholder for search input
 */
export default function SearchAndFilters({
  onSearch,
  onSortChange,
  onFilterChange,
  sortOptions = [],
  filterFields = [],
  searchPlaceholder = "Search..."
}) {
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filters, setFilters] = useState({});

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
    onSortChange({ sort_by: field, sort_order: order });
  };

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearAll = () => {
    setSearchInput("");
    setSortBy("");
    setSortOrder("asc");
    setFilters({});
    onSearch("");
    onSortChange({ sort_by: "", sort_order: "asc" });
    onFilterChange({});
  };

  return (
    <div className="mb-4 p-3 bg-light rounded">
      {/* Search Bar */}
      <Form onSubmit={handleSearch} className="mb-3">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder={searchPlaceholder}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button variant="primary" type="submit">
            <i className="bi bi-search me-1"></i>
            Search
          </Button>
        </InputGroup>
      </Form>

      <Row className="g-2">
        {/* Sort Controls */}
        {sortOptions.length > 0 && (
          <Col md={6} lg={4}>
            <Form.Label className="small fw-bold mb-1">Sort By</Form.Label>
            <div className="d-flex gap-2">
              <Form.Select
                size="sm"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value, sortOrder)}
              >
                <option value="">-- Select --</option>
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Form.Select>
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={() => handleSortChange(sortBy, sortOrder === "asc" ? "desc" : "asc")}
                disabled={!sortBy}
                title={sortOrder === "asc" ? "Ascending" : "Descending"}
              >
                <i className={`bi bi-sort-${sortOrder === "asc" ? "down" : "up"}`}></i>
              </Button>
            </div>
          </Col>
        )}

        {/* Filter Fields */}
        {filterFields.map((field) => (
          <Col md={6} lg={4} key={field.name}>
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

        {/* Clear All Button */}
        <Col md={12} lg="auto" className="d-flex align-items-end">
          <Button size="sm" variant="outline-danger" onClick={handleClearAll} className="w-100">
            <i className="bi bi-x-circle me-1"></i>
            Clear All
          </Button>
        </Col>
      </Row>
    </div>
  );
}
