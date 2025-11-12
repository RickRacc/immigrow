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
              <Card className="h-100 shadow-sm border-0 rounded-4 position-relative">
                {o.imageUrl && (
                  <Card.Img
                    variant="top"
                    src={o.imageUrl}
                    alt=""
                    style={{ objectFit: "cover", height: 220 }}
                    loading="lazy"
                  />
                )}
                <Card.Body>
                  <Card.Title className="h5 mb-2">{o.name}</Card.Title>
                  <div className="small text-muted">
                    {[o.city, o.state].filter(Boolean).join(", ")}
                  </div>
                  {o.topic && <Badge bg="secondary" className="mt-2">{o.topic}</Badge>}
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
