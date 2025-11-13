// src/pages/Search.jsx
import { useState } from "react";
import { Container, Form, Row, Col, Spinner, Alert } from "react-bootstrap";
import { fetchEvents, fetchOrgs, fetchResources } from "../lib/api";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState(""); // Track what's actually being searched

  // State for each model's results
  const [eventsData, setEventsData] = useState({ data: [], total: 0 });
  const [orgsData, setOrgsData] = useState({ data: [], total: 0 });
  const [resourcesData, setResourcesData] = useState({ data: [], total: 0 });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError("");
    setAppliedSearch(searchQuery);

    try {
      // Make 3 parallel API calls to search all models
      const [eventsResponse, orgsResponse, resourcesResponse] = await Promise.all([
        fetchEvents(1, 15, { search: searchQuery }),
        fetchOrgs(1, 15, { search: searchQuery }),
        fetchResources(1, 15, { search: searchQuery })
      ]);

      // Update state with results
      setEventsData({
        data: eventsResponse.data || [],
        total: eventsResponse.total || 0
      });
      setOrgsData({
        data: orgsResponse.data || [],
        total: orgsResponse.total || 0
      });
      setResourcesData({
        data: resourcesResponse.data || [],
        total: resourcesResponse.total || 0
      });
    } catch (err) {
      setError(`Search failed: ${err.message}`);
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
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
              disabled={loading}
            />
          </Col>
          <Col md={4} lg={3}>
            <button
              type="submit"
              className="btn btn-primary btn-lg w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </button>
          </Col>
        </Row>
      </Form>

      {/* Error Display */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Show search query if results are displayed */}
      {appliedSearch && !loading && (
        <p className="text-muted mb-3">
          Showing results for: <strong>{appliedSearch}</strong>
        </p>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Searching across all models...</p>
        </div>
      )}

      {/* Results Sections - Horizontal Layout */}
      {!loading && appliedSearch && (
        <Row className="mt-4">
          <Col md={4}>
            <h2 className="mb-3">
              Events
              <span className="text-muted fs-6 ms-2">({eventsData.total})</span>
            </h2>
            {eventsData.total === 0 ? (
              <p className="text-muted">No events found</p>
            ) : (
              <p className="text-muted">
                Showing {eventsData.data.length} of {eventsData.total} events
              </p>
            )}
          </Col>

          <Col md={4}>
            <h2 className="mb-3">
              Organizations
              <span className="text-muted fs-6 ms-2">({orgsData.total})</span>
            </h2>
            {orgsData.total === 0 ? (
              <p className="text-muted">No organizations found</p>
            ) : (
              <p className="text-muted">
                Showing {orgsData.data.length} of {orgsData.total} organizations
              </p>
            )}
          </Col>

          <Col md={4}>
            <h2 className="mb-3">
              Resources
              <span className="text-muted fs-6 ms-2">({resourcesData.total})</span>
            </h2>
            {resourcesData.total === 0 ? (
              <p className="text-muted">No resources found</p>
            ) : (
              <p className="text-muted">
                Showing {resourcesData.data.length} of {resourcesData.total} resources
              </p>
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
}
