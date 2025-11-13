// src/pages/OrgDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Spinner, Alert, Badge, Card, Row, Col } from "react-bootstrap";
import { fetchOrgById } from "../lib/api";

export default function OrgDetail() {
  const { id } = useParams();
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const data = await fetchOrgById(id);
        if (cancel) return;
        setOrg(data);
      } catch (ex) {
        setErr(ex.message || String(ex));
      } finally {
        setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [id]);

  if (loading) return <div className="container py-4"><Spinner animation="border" /></div>;
  if (err) return <div className="container py-4"><Alert variant="danger">Error loading organization: {err}</Alert></div>;
  if (!org) return <div className="container py-4"><Alert variant="warning">Organization not found.</Alert></div>;

  return (
    <div className="container py-4">
      <p><Link to="/orgs">← Back to organizations</Link></p>

      {/* Organization Header */}
      <div className="d-flex align-items-center gap-3 mb-3">
        {org.image_url && (
          <img
            src={org.image_url}
            alt=""
            style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 12 }}
          />
        )}
        <div>
          <h1 className="mb-1">{org.name}</h1>
          <div className="text-muted">
            <i className="bi bi-geo-alt-fill me-1"></i>
            {[org.city, org.state].filter(Boolean).join(", ")}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {org.topic && <Badge bg="primary" className="fs-6">{org.topic}</Badge>}
        {org.size && <Badge bg="secondary" className="fs-6">{org.size}</Badge>}
        {org.meeting_frequency && (
          <Badge bg="info" className="fs-6">
            <i className="bi bi-calendar-event me-1"></i>
            Meets {org.meeting_frequency}
          </Badge>
        )}
      </div>

      {/* Description */}
      {org.description && (
        <div className="mb-4">
          <h3 className="h5 mb-2">About</h3>
          <div className="fs-5 text-dark" style={{ lineHeight: "1.6" }}>
            {org.description}
          </div>
        </div>
      )}

      {/* Additional Details */}
      <div className="mb-4">
        <Row className="g-3">
          {org.ein && (
            <Col md={6}>
              <Card className="border-0 bg-light">
                <Card.Body>
                  <div className="small text-muted mb-1">Employer ID Number (EIN)</div>
                  <div className="fw-semibold">{org.ein}</div>
                </Card.Body>
              </Card>
            </Col>
          )}
          {org.subsection_code && (
            <Col md={6}>
              <Card className="border-0 bg-light">
                <Card.Body>
                  <div className="small text-muted mb-1">IRS Subsection</div>
                  <div className="fw-semibold">{org.subsection_code}</div>
                </Card.Body>
              </Card>
            </Col>
          )}
          {org.ntee_code && (
            <Col md={6}>
              <Card className="border-0 bg-light">
                <Card.Body>
                  <div className="small text-muted mb-1">NTEE Code</div>
                  <div className="fw-semibold">{org.ntee_code}</div>
                </Card.Body>
              </Card>
            </Col>
          )}
          {org.address && (
            <Col md={6}>
              <Card className="border-0 bg-light">
                <Card.Body>
                  <div className="small text-muted mb-1">Address</div>
                  <div className="fw-semibold">
                    {org.address}
                    {org.zipcode && `, ${org.zipcode}`}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </div>

      {/* External Links */}
      <div className="mb-4 d-flex flex-wrap gap-2">
        {org.external_url && (
          <a href={org.external_url} target="_blank" rel="noreferrer" className="btn btn-primary">
            View on ProPublica →
          </a>
        )}
        {org.guidestar_url && (
          <a href={org.guidestar_url} target="_blank" rel="noreferrer" className="btn btn-outline-secondary">
            GuideStar Profile
          </a>
        )}
        {org.form_990_pdf_url && (
          <a href={org.form_990_pdf_url} target="_blank" rel="noreferrer" className="btn btn-outline-secondary">
            <i className="bi bi-file-pdf me-1"></i>
            Form 990 (PDF)
          </a>
        )}
      </div>

      {/* Events Hosted */}
      {org.events && org.events.length > 0 && (
        <div className="mb-4">
          <h3 className="h5 mb-3">Events Hosted ({org.events.length})</h3>
          <Row xs={1} md={2} className="g-3">
            {org.events.map((event) => (
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

      {/* Related Resources */}
      {org.resources && org.resources.length > 0 && (
        <div className="mb-4">
          <h3 className="h5 mb-3">Related Resources ({org.resources.length})</h3>
          <Row xs={1} md={2} className="g-3">
            {org.resources.map((resource) => (
              <Col key={resource.id}>
                <Link to={`/resources/${resource.id}`} className="text-decoration-none">
                  <Card className="h-100 shadow-sm border-0 hover-shadow">
                    <Card.Body>
                      <div className="d-flex gap-2 mb-2">
                        <Badge bg="success">{resource.scope}</Badge>
                        <Badge bg="info">{resource.topic}</Badge>
                      </div>
                      <Card.Title className="h6 mb-2">{resource.title}</Card.Title>
                      <p className="small text-muted mb-0">
                        {resource.description?.slice(0, 100)}
                        {resource.description?.length > 100 ? "..." : ""}
                      </p>
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
