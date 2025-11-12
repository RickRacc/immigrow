// src/pages/Orgs.jsx
import { useEffect, useState } from "react";
import { Row, Col, Card, Spinner, Alert, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { fetchOrgs } from "../lib/api";
import Pagination, { PaginationInfo } from "../components/Pagination";

export default function Orgs() {
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
        const response = await fetchOrgs(currentPage, 15);
        if (cancel) return;
        const data = response.data ?? [];
        const rows = data.map(o => ({
          id: o.id,
          name: o.name ?? "Unnamed organization",
          city: o.city ?? "",
          state: o.state ?? "",
          topic: o.topic ?? "",
          size: o.size ?? "",
          description: o.description ?? "",
          meetingFrequency: o.meeting_frequency ?? "",
          ein: o.ein ?? "",
          imageUrl: (typeof o.image_url === 'string' && /^https?:\/\//i.test(o.image_url)) ? o.image_url : null,
        }));
        // optional: sort by name
        rows.sort((a,b)=>a.name.localeCompare(b.name));
        setItems(rows);
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

  if (loading) return (
    <div className="container py-4">
      <Spinner animation="border" />
    </div>
  );

  if (err) return (
    <div className="container py-4">
      <Alert variant="danger">
        Error loading organizations: {err}
      </Alert>
    </div>
  );

  return (
    <div className="container py-3">
      <h1 className="mb-3">Search from {total} Organizations</h1>
      <PaginationInfo currentCount={items.length} itemType="organizations" />

      <Row xs={1} md={2} lg={3} className="g-3">
        {items.map((o) => (
          <Col key={o.id}>
            <Link to={`/orgs/${o.id}`} className="text-reset text-decoration-none">
              <Card className="h-100 shadow-sm border-0 rounded-4 position-relative" style={{ minHeight: "280px" }}>
                {o.imageUrl && (
                  <Card.Img
                    variant="top"
                    src={o.imageUrl}
                    alt=""
                    style={{ objectFit: "cover", height: 160 }}
                    loading="lazy"
                  />
                )}
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="h5 mb-2">{o.name}</Card.Title>

                  <div className="small text-muted mb-2">
                    <i className="bi bi-geo-alt-fill me-1"></i>
                    {[o.city, o.state].filter(Boolean).join(", ")}
                  </div>

                  <div className="d-flex flex-wrap gap-1 mb-2">
                    {o.topic && <Badge bg="primary" className="text-white">{o.topic}</Badge>}
                    {o.size && <Badge bg="secondary">{o.size}</Badge>}
                  </div>

                  {o.meetingFrequency && (
                    <div className="small text-muted mb-2">
                      <i className="bi bi-calendar-event me-1"></i>
                      Meets {o.meetingFrequency}
                    </div>
                  )}

                  {o.description && (
                    <p className="small text-muted mb-0 mt-auto" style={{ lineHeight: "1.4" }}>
                      {o.description.slice(0, 100)}
                      {o.description.length > 100 ? "..." : ""}
                    </p>
                  )}

                  {o.ein && (
                    <div className="small text-muted mt-2">
                      <span className="badge bg-light text-dark">EIN: {o.ein}</span>
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
