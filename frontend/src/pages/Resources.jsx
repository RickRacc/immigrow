// src/pages/Resources.jsx
import { useEffect, useState } from "react";
import { Row, Col, Card, Spinner, Alert, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { fetchResources } from "../lib/api";
import Pagination, { PaginationInfo } from "../components/Pagination";

export default function Resources() {
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
        const response = await fetchResources(currentPage, 15);
        if (cancel) return;

        const data = response.data ?? [];
        const rows = data.map((r) => ({
          id: r.id,
          title: r.title ?? "Untitled",
          topic: r.topic ?? "Immigration Law",
          imageUrl: r.image_url || r.imageUrl || r.image || null,
          subtitle:
            [r.court_name, r.scope].filter(Boolean).join(" · ") || r.court_name || r.scope || "",
          foot: [
            r.citation,
            r.docket_number && `Docket: ${r.docket_number}`,
            r.date_published && `Filed: ${r.date_published}`,
          ]
            .filter(Boolean)
            .join(" · "),
        }));

        setItems(rows);
        setTotal(response.total ?? 0);
        setTotalPages(response.total_pages ?? 1);
      } catch (ex) {
        setErr(ex.message || String(ex));
      } finally {
        setLoading(false);
      }
    })();
    return () => void (cancel = true);
  }, [currentPage]);

  if (loading) return (<div className="container py-4"><Spinner animation="border" /></div>);
  if (err)      return (<div className="container py-4"><Alert variant="danger">Error: {err}</Alert></div>);

  return (
    <div className="container py-3">
      <h1 className="mb-3">Search from {total} Resources</h1>
      <PaginationInfo currentCount={items.length} itemType="resources" />

      <Row xs={1} md={2} lg={3} className="g-3">
        {items.map((r) => (
          <Col key={r.id}>
            <Link to={`/resources/${r.id}`} className="text-reset text-decoration-none">
              <Card className="h-100 shadow-sm border-0 rounded-4 position-relative" style={{ minHeight: "280px" }}>
                {r.imageUrl && (
                  <Card.Img
                    variant="top"
                    src={r.imageUrl}
                    alt=""
                    style={{ objectFit: "cover", height: 160 }}
                    loading="lazy"
                  />
                )}
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="h5 mb-2">{r.title}</Card.Title>

                  {r.topic && (
                    <div className="mb-2">
                      <Badge bg="warning" text="dark">{r.topic}</Badge>
                    </div>
                  )}

                  {r.subtitle && (
                    <div className="small text-muted mb-2">{r.subtitle}</div>
                  )}

                  {r.foot && (
                    <div className="small text-muted mt-auto" style={{ lineHeight: "1.4" }}>
                      {r.foot}
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
