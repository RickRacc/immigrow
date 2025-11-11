// src/pages/Orgs.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";
import { fetchOrgs } from "../lib/api";

export default function Orgs() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetchOrgs().then(setItems).catch((e) => setErr(e.message));
  }, []);

  if (err) return <div className="alert alert-danger">Error: {err}</div>;

  return (
    <Container className="py-4">
      <h1 className="mb-3">Search from {items.length} Organizations</h1>

      <Row xs={1} md={2} lg={3} className="g-4">
        {items.map((o) => (
          <Col key={o.id}>
            <Link to={`/orgs/${o.id}`} className="text-decoration-none text-reset">
              <Card className="h-100 shadow-sm border-0 rounded-4 position-relative">
                <Card.Img
                  src={o.imageUrl}
                  alt=""
                  style={{ aspectRatio: "3 / 2", objectFit: "cover" }}
                />
                <Card.Body>
                  <Card.Title>{o.name}</Card.Title>
                  <Card.Text className="text-muted">
                    {[o.city, o.state].filter(Boolean).join(", ")}
                    {o.topic ? ` | ${o.topic}` : ""}
                  </Card.Text>
                  {o.meeting && <small className="text-muted">{o.meeting}</small>}
                </Card.Body>
                <div className="stretched-link" />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
