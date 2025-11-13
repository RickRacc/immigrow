// src/pages/Search.jsx
import { useState } from "react";
import { Container, Form, Row, Col } from "react-bootstrap";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search logic will be implemented in next commit
    console.log("Searching for:", searchQuery);
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Search All</h1>

      {/* Search Input */}
      <Form onSubmit={handleSearchSubmit} className="mb-4">
        <Row>
          <Col md={8} lg={6}>
            <Form.Control
              type="text"
              placeholder="Search events, organizations, and resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="lg"
            />
          </Col>
          <Col md={4} lg={3}>
            <button type="submit" className="btn btn-primary btn-lg w-100">
              Search
            </button>
          </Col>
        </Row>
      </Form>

      {/* Results Sections - Placeholders */}
      <div className="mt-5">
        <h2 className="mb-3">Events</h2>
        <p className="text-muted">Event results will appear here...</p>
      </div>

      <div className="mt-5">
        <h2 className="mb-3">Organizations</h2>
        <p className="text-muted">Organization results will appear here...</p>
      </div>

      <div className="mt-5">
        <h2 className="mb-3">Resources</h2>
        <p className="text-muted">Resource results will appear here...</p>
      </div>
    </Container>
  );
}
