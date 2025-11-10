import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import { fetchResources } from "../lib/api";

// Helper to normalize URLs like //example.com/foo
const norm = (u) => (u?.startsWith("//") ? `https:${u}` : u);

export default function Resources() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const data = await fetchResources(); // GET /api/resources
        if (!cancel) setItems(data || []);
      } catch (e) {
        if (!cancel) setErr(e?.message || String(e));
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const rows = (items || []).map((r) => ({
    id: r.id,
    title: r.name || r.title,
    topic: r.topic,
    description: r.description,
    imageUrl: norm(r.image_url) || "/images/resources/default.jpg", // 👈 fallback
  }));

  if (err) {
    return (
      <Container className="py-4">
        <div className="alert alert-danger">Error: {err}</div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Search from {rows.length} Resources</h2>

      <Row xs={1} sm={2} lg={3} className="g-4">
        {rows.map((r) => (
          <Col key={r.id}>
            {/* Entire card is clickable */}
            <Link
              to={`/resources/${r.id}`} // supports /resources/2 or /resources/res-2 (detail strips prefix)
              className="text-decoration-none text-reset"
            >
              <Card className="h-100 shadow-sm border-0 rounded-4 position-relative">
                <Card.Img
                  src={r.imageUrl}
                  alt={r.title}
                  onError={(e) =>
                    (e.currentTarget.src = "/images/resources/default.jpg")
                  }
                  style={{ height: 200, objectFit: "cover" }}
                />
                <Card.Body>
                  <Card.Title className="h6 mb-2">{r.title}</Card.Title>
                  {r.topic && (
                    <Badge bg="warning" text="dark" className="mb-2">
                      {r.topic}
                    </Badge>
                  )}
                  <Card.Text className="text-muted small mb-0">
                    {r.description
                      ? r.description.slice(0, 110) +
                        (r.description.length > 110 ? "…" : "")
                      : "Learn more"}
                  </Card.Text>
                </Card.Body>

                {/* Required by Bootstrap for stretched-link to cover the whole card */}
                <span className="stretched-link" />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
