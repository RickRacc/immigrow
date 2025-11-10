// src/pages/EventDetail.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Button } from "react-bootstrap";
import { fetchEventById } from "../lib/api";

export default function EventDetail() {
  const { id } = useParams();
  const cleanId = String(id).replace(/^evt-/, ""); // handle /events/evt-3

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const ev = await fetchEventById(cleanId);
        if (!cancel) setData(ev);
      } catch (e) {
        if (!cancel) setErr(e?.message || String(e));
      }
    })();
    return () => {
      cancel = true;
    };
  }, [cleanId]);

  if (err) {
    return (
      <Container className="py-4">
        <div className="alert alert-danger">Error: {err}</div>
        <Link to="/events">← Back to Events</Link>
      </Container>
    );
  }

  if (!data) return <Container className="py-4">Loading event…</Container>;

  const title = data.name || data.title || `Event ${cleanId}`;
  const place =
    data.location ||
    (data.city && data.state
      ? `${data.city}, ${data.state}`
      : data.city || data.state || "");
  const rawImg = data.image_url || "";
  const imageUrl = rawImg
    ? rawImg.startsWith("//")
      ? `https:${rawImg}`
      : rawImg
    : "/images/events/default.jpg";
  const withProto = (url) =>
    !url ? "" : url.startsWith("http") ? url : `https://${url}`;

  return (
    <Container className="py-4">
      <div className="mb-3">
        <Link to="/events">← Back to Events</Link>
      </div>

      <h1 className="mb-1">{title}</h1>
      {place && <div className="text-muted mb-3">{place}</div>}

      <Row className="g-4">
        {/* Left: hero + quick facts */}
        <Col md={4}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Img
              src={imageUrl}
              alt={title}
              onError={(e) => (e.currentTarget.src = "/images/events/default.jpg")}
              style={{ height: 220, objectFit: "cover" }}
            />
            <Card.Body>
              <ul className="list-unstyled small m-0">
                {data.date && (
                  <li className="py-1">
                    <strong>Date:</strong> {data.date}
                  </li>
                )}
                {data.time && (
                  <li className="py-1">
                    <strong>Time:</strong> {data.time}
                  </li>
                )}
                {data.topic && (
                  <li className="py-1">
                    <strong>Topic:</strong> <Badge bg="primary">{data.topic}</Badge>
                  </li>
                )}
                {data.address && (
                  <li className="py-1">
                    <strong>Address:</strong> {data.address}
                  </li>
                )}
              </ul>
            </Card.Body>

            {(data.external_url || data.website || data.register_url) && (
              <Card.Footer className="bg-white d-flex gap-2 flex-wrap">
                {data.external_url && (
                  <Button
                    size="sm"
                    as="a"
                    href={withProto(data.external_url)}
                    target="_blank"
                    rel="noreferrer"
                    variant="outline-primary"
                  >
                    View Event
                  </Button>
                )}
                {data.website && (
                  <Button
                    size="sm"
                    as="a"
                    href={withProto(data.website)}
                    target="_blank"
                    rel="noreferrer"
                    variant="outline-secondary"
                  >
                    Website
                  </Button>
                )}
                {data.register_url && (
                  <Button
                    size="sm"
                    as="a"
                    href={withProto(data.register_url)}
                    target="_blank"
                    rel="noreferrer"
                    variant="primary"
                  >
                    Register
                  </Button>
                )}
              </Card.Footer>
            )}
          </Card>
        </Col>

        {/* Right: details */}
        <Col md={8}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body>
              <h5 className="mb-3">Details</h5>
              <p className="mb-0">{data.description || "Details coming soon."}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
