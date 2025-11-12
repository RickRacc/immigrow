// src/pages/Events.jsx
import { useEffect, useState } from "react";
import { Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { fetchEvents } from "../lib/api";
import Pagination, { PaginationInfo } from "../components/Pagination";

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

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const response = await fetchEvents(currentPage, 15);
        if (cancel) return;

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
            venue: e.venue ?? e.venue_name ?? e.location ?? null,
            imageUrl: image,
          };
        });

        // Sort by image priority: unique images first, then shuffle default images, then no images
        const DEFAULT_IMAGE = "https://images.squarespace-cdn.com/content/v1/63b4656c9f96340195a2ff05/1754335248384-JOT195Q5KSY1N0L0CYW8/raices_events.png";

        const uniqueImages = rows.filter(e => e.imageUrl && e.imageUrl !== DEFAULT_IMAGE);
        const defaultImages = rows.filter(e => e.imageUrl === DEFAULT_IMAGE);
        const noImages = rows.filter(e => !e.imageUrl);

        // Shuffle the default images to spread them out
        const shuffled = [...defaultImages].sort(() => Math.random() - 0.5);

        // Interleave: unique images, then mix in default images, then no images
        const sorted = [...uniqueImages, ...shuffled, ...noImages];
        setItems(sorted);
        setTotal(response.total ?? 0);
        setTotalPages(response.total_pages ?? 1);
      } catch (ex) {
        setErr(ex.message || String(ex));
      } finally {
        setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [currentPage]);

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

  return (
    <div className="container py-3">
      <h1 className="mb-3">Search from {total} Events</h1>
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
                  <Card.Title className="h5 mb-2">{e.title}</Card.Title>
                  <div className="small text-muted">
                    {[e.city, e.state].filter(Boolean).join(", ") || e.venue || ""}
                  </div>
                  {(e.date || e.start) && (
                    <div className="small mt-1">
                      {[
                        e.date,
                        e.start && `• ${e.start}`,
                        e.end && `- ${e.end}`
                      ].filter(Boolean).join(" ")}
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
