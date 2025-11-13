// src/pages/Events.jsx
import { useEffect, useState } from "react";
import { Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { fetchEvents } from "../lib/api";
import Pagination, { PaginationInfo } from "../components/Pagination";
import SearchAndFilters from "../components/SearchAndFilters";
import HighlightedText from "../components/HighlightedText";

function hasHttp(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url);
}

export default function Events() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOptions, setSortOptions] = useState({ sort_by: "", sort_order: "asc" });
  const [filters, setFilters] = useState({});

  const loadEvents = async () => {
    setLoading(true);
    try {
      const options = {
        search: searchQuery,
        ...sortOptions,
        ...filters
      };

      const response = await fetchEvents(currentPage, 15, options);
      const data = response.data ?? [];
      const rows = data.map((e) => {
        const title = e.name ?? e.title ?? "Untitled event";
        const image = hasHttp(e.image_url) ? e.image_url : null;

        // Parse start_time which may contain both start and end times concatenated
        let start = null;
        let end = null;
        if (e.start_time) {
          // Replace non-breaking spaces with regular spaces and split by AM/PM
          const timeStr = e.start_time.replace(/\u202f/g, ' ');
          const timeMatch = timeStr.match(/^(.+?[AP]M)\s*(.+[AP]M)?$/i);
          if (timeMatch) {
            start = timeMatch[1].trim();
            end = timeMatch[2] ? timeMatch[2].trim() : (e.end_time ?? null);
          } else {
            start = timeStr;
            end = e.end_time ?? null;
          }
        }

        return {
          id: e.id,
          title,
          date: e.date ?? null,
          start,
          end,
          city: e.city ?? null,
          state: e.state ?? null,
          timezone: e.timezone ?? null,
          venue: e.venue ?? e.venue_name ?? e.location ?? null,
          imageUrl: image,
        };
      });

      setItems(rows);
      setTotal(response.total ?? 0);
      setTotalPages(response.total_pages ?? 1);
    } catch (ex) {
      setErr(ex.message || String(ex));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancel = false;
    if (!cancel) {
      loadEvents();
    }
    return () => { cancel = true; };
  }, [currentPage, searchQuery, sortOptions, filters]);

  if (loading) {
    return (
      <div className="container py-4">
        <Spinner animation="border" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="container py-4">
        <Alert variant="danger">Error loading events: {err}</Alert>
      </div>
    );
  }

  // Configuration for SearchAndFilters component
  const sortOptionsConfig = [
    { value: "date", label: "Date" },
    { value: "title", label: "Title" }
  ];

  const filterFieldsConfig = [
    {
      name: "state",
      label: "State",
      options: [
        { value: "TX", label: "Texas" },
        { value: "CA", label: "California" },
        { value: "NY", label: "New York" },
        { value: "FL", label: "Florida" },
        { value: "IL", label: "Illinois" },
        { value: "PA", label: "Pennsylvania" },
        { value: "AZ", label: "Arizona" },
        { value: "WA", label: "Washington" },
        { value: "KY", label: "Kentucky" }
      ]
    },
    {
      name: "timezone",
      label: "Timezone",
      options: [
        { value: "EST", label: "EST" },
        { value: "CST", label: "CST" },
        { value: "MST", label: "MST" },
        { value: "PST", label: "PST" }
      ]
    },
    {
      name: "duration",
      label: "Duration",
      options: [
        { value: "short", label: "Short (< 1 hour)" },
        { value: "medium", label: "Medium (1-1.5 hours)" },
        { value: "long", label: "Long (> 1.5 hours)" }
      ]
    }
  ];

  return (
    <div className="container py-3">
      <h1 className="mb-3">Search from {total} Events</h1>

      <SearchAndFilters
        onSearch={setSearchQuery}
        onSortChange={setSortOptions}
        onFilterChange={setFilters}
        sortOptions={sortOptionsConfig}
        filterFields={filterFieldsConfig}
        searchPlaceholder="Search events by title, location, description..."
      />

      <PaginationInfo currentCount={items.length} itemType="events" />

      <Row xs={1} md={2} lg={3} className="g-3">
        {items.map((e) => (
          <Col key={e.id}>
            <Link to={`/events/${e.id}`} className="text-reset text-decoration-none">
              <Card className="h-100 shadow-sm border-0 rounded-4 position-relative">
                {e.imageUrl && (
                  <Card.Img
                    variant="top"
                    src={e.imageUrl}
                    alt=""
                    style={{ objectFit: "cover", height: 220 }}
                    loading="lazy"
                  />
                )}
                <Card.Body>
                  <Card.Title className="h5 mb-2">
                    <HighlightedText text={e.title} searchQuery={searchQuery} />
                  </Card.Title>
                  <div className="small text-muted">
                    <HighlightedText
                      text={[e.city, e.state].filter(Boolean).join(", ") || e.venue || ""}
                      searchQuery={searchQuery}
                    />
                  </div>
                  {(e.date || e.start) && (
                    <div className="small mt-1">
                      {[
                        e.date,
                        e.start && `• ${e.start}`,
                        e.end && `- ${e.end}`
                      ].filter(Boolean).join(" ")}
                      {e.timezone && ` (${e.timezone})`}
                    </div>
                  )}
                </Card.Body>
                <span className="stretched-link" />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
