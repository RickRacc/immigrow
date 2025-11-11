// src/pages/Events.jsx
import { useEffect, useState } from "react";
import { Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { fetchEvents } from "../lib/api";

function hasHttp(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url);
}

export default function Events() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const data = await fetchEvents();
        if (cancel) return;

        const rows = (data ?? []).map((e) => {
          const title = e.name ?? e.title ?? "Untitled event";
          const image = hasHttp(e.image_url) ? e.image_url : null;
          return {
            id: e.id,
            title,
            date: e.date ?? null,
            start: e.start_time ?? null,
            end: e.end_time ?? null,
            city: e.city ?? null,
            state: e.state ?? null,
            venue: e.venue ?? e.venue_name ?? e.location ?? null,
            imageUrl: image,
          };
        });

        // images first
        rows.sort((a, b) => (b.imageUrl ? 1 : 0) - (a.imageUrl ? 1 : 0));
        setItems(rows);
      } catch (ex) {
        setErr(ex.message || String(ex));
      } finally {
        setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

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
      <h1 className="mb-3">Search from {items.length} Events</h1>

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
                      {[e.date, e.start && `• ${e.start}`].filter(Boolean).join(" ")}
                    </div>
                  )}
                </Card.Body>
                <span className="stretched-link" />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}
