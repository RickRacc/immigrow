// src/pages/Search.jsx
import { useState } from "react";
import { Container, Form, Row, Col, Spinner, Alert, Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { fetchEvents, fetchOrgs, fetchResources } from "../lib/api";
import HighlightedText from "../components/HighlightedText";
import MatchIndicator from "../components/MatchIndicator";
import Pagination from "../components/Pagination";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState(""); // Track what's actually being searched

  // State for each model's results
  const [eventsData, setEventsData] = useState({ data: [], total: 0, totalPages: 1 });
  const [orgsData, setOrgsData] = useState({ data: [], total: 0, totalPages: 1 });
  const [resourcesData, setResourcesData] = useState({ data: [], total: 0, totalPages: 1 });

  // Separate pagination state for each model
  const [eventsPage, setEventsPage] = useState(1);
  const [orgsPage, setOrgsPage] = useState(1);
  const [resourcesPage, setResourcesPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Track which models are loading individually
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);

  // Helper function to check if URL is valid
  const hasHttp = (url) => typeof url === 'string' && /^https?:\/\//i.test(url);

  // Helper function to parse event times (handles concatenated start/end times)
  const parseEventTime = (event) => {
    let start = null;
    let end = null;

    if (event.start_time) {
      // Replace non-breaking spaces with regular spaces and split by AM/PM
      const timeStr = event.start_time.replace(/\u202f/g, ' ');
      const timeMatch = timeStr.match(/^(.+?[AP]M)\s*(.+[AP]M)?$/i);
      if (timeMatch) {
        start = timeMatch[1].trim();
        end = timeMatch[2] ? timeMatch[2].trim() : (event.end_time ?? null);
      } else {
        start = timeStr;
        end = event.end_time ?? null;
      }
    }

    return { ...event, start_time: start, end_time: end };
  };

  // Match fields for each model (for MatchIndicator)
  const eventMatchFields = [
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
    { key: 'location', label: 'Location' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'venue_name', label: 'Venue' },
    { key: 'timezone', label: 'Timezone' },
    { key: 'external_url', label: 'URL' },
    { key: 'eventbrite_id', label: 'Eventbrite ID' }
  ];

  const orgMatchFields = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'topic', label: 'Topic' },
    { key: 'address', label: 'Address' },
    { key: 'zipcode', label: 'Zipcode' },
    { key: 'ein', label: 'EIN' },
    { key: 'size', label: 'Size' },
    { key: 'meeting_frequency', label: 'Meeting Frequency' }
  ];

  const resourceMatchFields = [
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
    { key: 'topic', label: 'Topic' },
    { key: 'scope', label: 'Scope' },
    { key: 'court_name', label: 'Court' },
    { key: 'citation', label: 'Citation' },
    { key: 'judge_name', label: 'Judge' },
    { key: 'docket_number', label: 'Docket Number' },
    { key: 'format', label: 'Format' },
    { key: 'external_url', label: 'URL' }
  ];

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError("");
    setAppliedSearch(searchQuery);

    // Reset all pages to 1 when new search is performed
    setEventsPage(1);
    setOrgsPage(1);
    setResourcesPage(1);

    try {
      // Make 3 parallel API calls to search all models
      const [eventsResponse, orgsResponse, resourcesResponse] = await Promise.all([
        fetchEvents(1, 15, { search: searchQuery }),
        fetchOrgs(1, 15, { search: searchQuery }),
        fetchResources(1, 15, { search: searchQuery })
      ]);

      // Update state with results (parse event times)
      setEventsData({
        data: (eventsResponse.data || []).map(parseEventTime),
        total: eventsResponse.total || 0,
        totalPages: eventsResponse.total_pages || 1
      });
      setOrgsData({
        data: orgsResponse.data || [],
        total: orgsResponse.total || 0,
        totalPages: orgsResponse.total_pages || 1
      });
      setResourcesData({
        data: resourcesResponse.data || [],
        total: resourcesResponse.total || 0,
        totalPages: resourcesResponse.total_pages || 1
      });
    } catch (err) {
      setError(`Search failed: ${err.message}`);
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Individual load functions for pagination
  const loadEventsPage = async (page) => {
    setLoadingEvents(true);
    try {
      const response = await fetchEvents(page, 15, { search: appliedSearch });
      setEventsData({
        data: (response.data || []).map(parseEventTime),
        total: response.total || 0,
        totalPages: response.total_pages || 1
      });
      setEventsPage(page);
    } catch (err) {
      console.error("Error loading events page:", err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadOrgsPage = async (page) => {
    setLoadingOrgs(true);
    try {
      const response = await fetchOrgs(page, 15, { search: appliedSearch });
      setOrgsData({
        data: response.data || [],
        total: response.total || 0,
        totalPages: response.total_pages || 1
      });
      setOrgsPage(page);
    } catch (err) {
      console.error("Error loading orgs page:", err);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const loadResourcesPage = async (page) => {
    setLoadingResources(true);
    try {
      const response = await fetchResources(page, 15, { search: appliedSearch });
      setResourcesData({
        data: response.data || [],
        total: response.total || 0,
        totalPages: response.total_pages || 1
      });
      setResourcesPage(page);
    } catch (err) {
      console.error("Error loading resources page:", err);
    } finally {
      setLoadingResources(false);
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
        <Row className="mt-4 g-4">
          {/* Events Column */}
          <Col md={4} className="border-end">
            <div className="mb-3">
              <h3 className="mb-1">Events</h3>
              <div className="text-muted small">
                Showing {eventsData.data.length} of {eventsData.total}
              </div>
            </div>
            {/* Scrollable container */}
            <div style={{ maxHeight: '800px', overflowY: 'auto', paddingRight: '10px' }}>
              {eventsData.total === 0 ? (
                <p className="text-muted">No events found</p>
              ) : (
                <>
                  {loadingEvents && (
                    <div className="text-center my-3">
                      <Spinner animation="border" size="sm" />
                    </div>
                  )}
                  <div className="d-flex flex-column gap-3">
                    {eventsData.data.map((event) => (
                    <Link
                      key={event.id}
                      to={`/events/${event.id}`}
                      className="text-reset text-decoration-none"
                    >
                      <Card className="shadow-sm border-0 rounded-4 position-relative" style={{ minHeight: '260px' }}>
                        {hasHttp(event.image_url) && (
                          <Card.Img
                            variant="top"
                            src={event.image_url}
                            alt=""
                            style={{ objectFit: "cover", height: 160 }}
                            loading="lazy"
                          />
                        )}
                        <Card.Body className="d-flex flex-column">
                          <Card.Title className="h6 mb-2">
                            <HighlightedText
                              text={event.title || event.name || "Untitled"}
                              searchQuery={appliedSearch}
                            />
                          </Card.Title>
                          <div className="small text-muted mb-2">
                            <HighlightedText
                              text={[event.city, event.state].filter(Boolean).join(", ") || event.location || ""}
                              searchQuery={appliedSearch}
                            />
                          </div>
                          {(event.date || event.start_time) && (
                            <div className="small mt-auto" style={{ lineHeight: "1.4" }}>
                              {[
                                event.date,
                                event.start_time && `• ${event.start_time}`,
                                event.end_time && `- ${event.end_time}`
                              ].filter(Boolean).join(" ")}
                              {event.timezone && ` (${event.timezone})`}
                            </div>
                          )}
                          <MatchIndicator
                            item={event}
                            searchQuery={appliedSearch}
                            fieldsToCheck={eventMatchFields}
                          />
                        </Card.Body>
                        <span className="stretched-link" />
                      </Card>
                    </Link>
                    ))}
                  </div>
                  {/* Pagination for Events */}
                  {eventsData.totalPages > 1 && !loadingEvents && (
                    <div className="mt-3 mb-3">
                      <Pagination
                        currentPage={eventsPage}
                        totalPages={eventsData.totalPages}
                        onPageChange={loadEventsPage}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </Col>

          {/* Organizations Column */}
          <Col md={4} className="border-end">
            <div className="mb-3">
              <h3 className="mb-1">Organizations</h3>
              <div className="text-muted small">
                Showing {orgsData.data.length} of {orgsData.total}
              </div>
            </div>
            {/* Scrollable container */}
            <div style={{ maxHeight: '800px', overflowY: 'auto', paddingRight: '10px' }}>
              {orgsData.total === 0 ? (
                <p className="text-muted">No organizations found</p>
              ) : (
                <>
                  {loadingOrgs && (
                    <div className="text-center my-3">
                      <Spinner animation="border" size="sm" />
                    </div>
                  )}
                  <div className="d-flex flex-column gap-3">
                    {orgsData.data.map((org) => (
                    <Link
                      key={org.id}
                      to={`/orgs/${org.id}`}
                      className="text-reset text-decoration-none"
                    >
                      <Card className="shadow-sm border-0 rounded-4 position-relative" style={{ minHeight: '260px' }}>
                        {hasHttp(org.image_url) && (
                          <Card.Img
                            variant="top"
                            src={org.image_url}
                            alt=""
                            style={{ objectFit: "cover", height: 160 }}
                            loading="lazy"
                          />
                        )}
                        <Card.Body className="d-flex flex-column">
                          <Card.Title className="h6 mb-2">
                            <HighlightedText
                              text={org.name || "Unnamed"}
                              searchQuery={appliedSearch}
                            />
                          </Card.Title>

                          <div className="small text-muted mb-2">
                            <i className="bi bi-geo-alt-fill me-1"></i>
                            <HighlightedText
                              text={[org.city, org.state].filter(Boolean).join(", ")}
                              searchQuery={appliedSearch}
                            />
                          </div>

                          <div className="d-flex flex-wrap gap-1 mb-2">
                            {org.topic && (
                              <Badge bg="primary" className="text-white">
                                <HighlightedText text={org.topic} searchQuery={appliedSearch} />
                              </Badge>
                            )}
                            {org.size && <Badge bg="secondary">{org.size}</Badge>}
                          </div>

                          {org.meeting_frequency && (
                            <div className="small text-muted mb-2">
                              <i className="bi bi-calendar-event me-1"></i>
                              Meets {org.meeting_frequency}
                            </div>
                          )}

                          {org.description && (
                            <p className="small text-muted mb-0 mt-auto" style={{ lineHeight: "1.4" }}>
                              <HighlightedText
                                text={org.description.slice(0, 100) + (org.description.length > 100 ? "..." : "")}
                                searchQuery={appliedSearch}
                              />
                            </p>
                          )}

                          {org.ein && (
                            <div className="small text-muted mt-2">
                              <span className="badge bg-light text-dark">EIN: {org.ein}</span>
                            </div>
                          )}

                          <MatchIndicator
                            item={org}
                            searchQuery={appliedSearch}
                            fieldsToCheck={orgMatchFields}
                          />
                        </Card.Body>
                        <span className="stretched-link" />
                      </Card>
                    </Link>
                    ))}
                  </div>
                  {/* Pagination for Organizations */}
                  {orgsData.totalPages > 1 && !loadingOrgs && (
                    <div className="mt-3 mb-3">
                      <Pagination
                        currentPage={orgsPage}
                        totalPages={orgsData.totalPages}
                        onPageChange={loadOrgsPage}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </Col>

          {/* Resources Column */}
          <Col md={4}>
            <div className="mb-3">
              <h3 className="mb-1">Resources</h3>
              <div className="text-muted small">
                Showing {resourcesData.data.length} of {resourcesData.total}
              </div>
            </div>
            {/* Scrollable container */}
            <div style={{ maxHeight: '800px', overflowY: 'auto', paddingRight: '10px' }}>
              {resourcesData.total === 0 ? (
                <p className="text-muted">No resources found</p>
              ) : (
                <>
                  {loadingResources && (
                    <div className="text-center my-3">
                      <Spinner animation="border" size="sm" />
                    </div>
                  )}
                  <div className="d-flex flex-column gap-3">
                    {resourcesData.data.map((resource) => (
                    <Link
                      key={resource.id}
                      to={`/resources/${resource.id}`}
                      className="text-reset text-decoration-none"
                    >
                      <Card className="shadow-sm border-0 rounded-4 position-relative" style={{ minHeight: '260px' }}>
                        {hasHttp(resource.image_url) && (
                          <Card.Img
                            variant="top"
                            src={resource.image_url}
                            alt=""
                            style={{ objectFit: "cover", height: 160 }}
                            loading="lazy"
                          />
                        )}
                        <Card.Body className="d-flex flex-column">
                          <Card.Title className="h6 mb-2">
                            <HighlightedText
                              text={resource.title || "Untitled"}
                              searchQuery={appliedSearch}
                            />
                          </Card.Title>

                          {resource.topic && (
                            <div className="mb-2">
                              <Badge bg="warning" text="dark">
                                <HighlightedText text={resource.topic} searchQuery={appliedSearch} />
                              </Badge>
                            </div>
                          )}

                          {[resource.court_name, resource.scope].filter(Boolean).join(" · ") && (
                            <div className="small text-muted mb-2">
                              <HighlightedText
                                text={[resource.court_name, resource.scope].filter(Boolean).join(" · ")}
                                searchQuery={appliedSearch}
                              />
                            </div>
                          )}

                          {resource.foot && (
                            <div className="small text-muted mt-auto" style={{ lineHeight: "1.4" }}>
                              <HighlightedText text={resource.foot} searchQuery={appliedSearch} />
                            </div>
                          )}

                          <MatchIndicator
                            item={resource}
                            searchQuery={appliedSearch}
                            fieldsToCheck={resourceMatchFields}
                          />
                        </Card.Body>
                        <span className="stretched-link" />
                      </Card>
                    </Link>
                    ))}
                  </div>
                  {/* Pagination for Resources */}
                  {resourcesData.totalPages > 1 && !loadingResources && (
                    <div className="mt-3 mb-3">
                      <Pagination
                        currentPage={resourcesPage}
                        totalPages={resourcesData.totalPages}
                        onPageChange={loadResourcesPage}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
}
