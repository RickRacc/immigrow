// src/pages/ResourceDetail.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Alert, Badge, Card, Row, Col } from "react-bootstrap";
import { fetchResourceById } from "../lib/api";

export default function ResourceDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetchResourceById(id);
        if (!cancel) setData(r);
      } catch (e) {
        if (!cancel) setErr(e.message);
      }
    })();
    return () => void (cancel = true);
  }, [id]);

  if (err) return <div className="container py-4"><Alert variant="danger">Error: {err}</Alert></div>;
  if (!data) return <div className="container py-4">Loading…</div>;

  // Fix audio_url if it has double courtlistener prefix
  const cleanAudioUrl = data.audio_url
    ? data.audio_url.replace('https://www.courtlistener.comhttps//', 'https://')
                    .replace('https://www.courtlistener.comhttp://', 'http://')
    : null;

  // Determine if audio_url is actually audio or PDF based on file extension
  const isAudioFile = cleanAudioUrl && (
    cleanAudioUrl.includes('.mp3') ||
    cleanAudioUrl.includes('.m4a') ||
    cleanAudioUrl.includes('.wav') ||
    cleanAudioUrl.includes('oral_argument')
  );

  return (
    <div className="container py-4">
      <p className="mb-3"><Link to="/resources">← Back to resources</Link></p>

      <h1 className="mb-2">{data.title ?? `Resource ${id}`}</h1>

      {/* Badges */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {data.topic && <Badge bg="warning" text="dark" className="fs-6">{data.topic}</Badge>}
        {data.scope && <Badge bg="success" className="fs-6">{data.scope}</Badge>}
      </div>

      {/* Media Links */}
      <div className="mb-4 d-flex flex-wrap gap-2">
        {data.external_url && (
          <a href={data.external_url} target="_blank" rel="noreferrer" className="btn btn-primary">
            <i className="bi bi-box-arrow-up-right me-2"></i>
            View on CourtListener
          </a>
        )}
        {cleanAudioUrl && (
          <a href={cleanAudioUrl} target="_blank" rel="noreferrer" className="btn btn-outline-primary">
            {isAudioFile ? (
              <>
                <i className="bi bi-volume-up-fill me-2"></i>
                Listen to Oral Arguments
              </>
            ) : (
              <>
                <i className="bi bi-file-pdf me-2"></i>
                View Court Opinion (PDF)
              </>
            )}
          </a>
        )}
      </div>

      {/* Case Details - Prominent Section */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <h3 className="h5 mb-3">Case Information</h3>
          <Row>
            {data.court_name && (
              <Col md={6} className="mb-3">
                <div className="text-muted small mb-1">Court</div>
                <div className="fw-semibold">{data.court_name}</div>
              </Col>
            )}
            {data.citation && (
              <Col md={6} className="mb-3">
                <div className="text-muted small mb-1">Citation</div>
                <div className="fw-semibold">{data.citation}</div>
              </Col>
            )}
            {data.docket_number && (
              <Col md={6} className="mb-3">
                <div className="text-muted small mb-1">Docket Number</div>
                <div className="fw-semibold">{data.docket_number}</div>
              </Col>
            )}
            {data.date_published && (
              <Col md={6} className="mb-3">
                <div className="text-muted small mb-1">Date Filed</div>
                <div className="fw-semibold">{data.date_published}</div>
              </Col>
            )}
            {data.date_argued && (
              <Col md={6} className="mb-3">
                <div className="text-muted small mb-1">Date Argued</div>
                <div className="fw-semibold">{data.date_argued}</div>
              </Col>
            )}
            {data.case_name && (
              <Col md={12} className="mb-3">
                <div className="text-muted small mb-1">Case Name</div>
                <div className="fw-semibold">{data.case_name}</div>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      {/* Description - Minimized */}
      {data.description && (
        <div className="mb-4">
          <h3 className="h5 mb-2">Description</h3>
          <p className="text-muted mb-0" style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
            {data.description.length > 300
              ? `${data.description.slice(0, 300)}...`
              : data.description}
          </p>
        </div>
      )}

      {/* Related Events */}
      {data.events && data.events.length > 0 && (
        <div className="mb-4">
          <h3 className="h5 mb-3">Related Events ({data.events.length})</h3>
          <Row xs={1} md={2} className="g-3">
            {data.events.map((event) => (
              <Col key={event.id}>
                <Link to={`/events/${event.id}`} className="text-decoration-none">
                  <Card className="h-100 shadow-sm border-0 hover-shadow">
                    <Card.Body>
                      <Card.Title className="h6 mb-2">{event.title}</Card.Title>
                      <div className="small text-muted mb-2">
                        <i className="bi bi-calendar me-1"></i>
                        {event.date}
                        {event.start_time && ` • ${event.start_time}`}
                      </div>
                      <div className="small text-muted">
                        <i className="bi bi-geo-alt me-1"></i>
                        {event.location || [event.city, event.state].filter(Boolean).join(", ")}
                      </div>
                      {event.description && (
                        <p className="small text-muted mb-0 mt-2">
                          {event.description.slice(0, 100)}
                          {event.description.length > 100 ? "..." : ""}
                        </p>
                      )}
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* Related Organizations */}
      {data.organizations && data.organizations.length > 0 && (
        <div className="mb-4">
          <h3 className="h5 mb-3">Related Organizations ({data.organizations.length})</h3>
          <Row xs={1} md={2} className="g-3">
            {data.organizations.map((org) => (
              <Col key={org.id}>
                <Link to={`/orgs/${org.id}`} className="text-decoration-none">
                  <Card className="h-100 shadow-sm border-0 hover-shadow">
                    <Card.Body>
                      <div className="d-flex gap-2 mb-2">
                        {org.topic && <Badge bg="primary">{org.topic}</Badge>}
                        {org.size && <Badge bg="secondary">{org.size}</Badge>}
                      </div>
                      <Card.Title className="h6 mb-2">{org.name}</Card.Title>
                      <div className="small text-muted mb-2">
                        <i className="bi bi-geo-alt-fill me-1"></i>
                        {[org.city, org.state].filter(Boolean).join(", ")}
                      </div>
                      {org.description && (
                        <p className="small text-muted mb-0">
                          {org.description.slice(0, 100)}
                          {org.description.length > 100 ? "..." : ""}
                        </p>
                      )}
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
}
