import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Alert, Spinner, Badge, Card, Row, Col } from "react-bootstrap";
import { fetchEventById } from "../lib/api";

export default function EventDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const e = await fetchEventById(id);
        if (cancel) return;

        setData(e);
      } catch (ex) {
        setErr(ex.message || String(ex));
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [id]);

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
        <Alert variant="danger">Error: {err}</Alert>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="container py-4">
        <Alert variant="warning">Event not found.</Alert>
      </div>
    );
  }

  const orgId =
    data.organization_id ?? data.organizationId ?? data.org_id ?? null;

  // Parse start_time which may contain both start and end times concatenated
  let startTime = null;
  let endTime = null;
  if (data.start_time) {
    // Replace non-breaking spaces with regular spaces and split by AM/PM
    const timeStr = data.start_time.replace(/\u202f/g, ' ');
    const timeMatch = timeStr.match(/^(.+?[AP]M)\s*(.+[AP]M)?$/i);
    if (timeMatch) {
      startTime = timeMatch[1].trim();
      endTime = timeMatch[2] ? timeMatch[2].trim() : (data.end_time ?? null);
    } else {
      startTime = timeStr;
      endTime = data.end_time ?? null;
    }
  }

  // Parse description to extract embedded title if present
  const parseDescription = (desc) => {
    if (!desc) return { title: null, body: null };

    // Remove trailing >>> or similar artifacts
    let cleanDesc = desc.replace(/>>>+\s*$/, '').trim();

    // Pattern: ALL CAPS TEXT followed by rest of description
    // Example: "BEYOND THE CHART: IMMIGRATION STORIES..."
    const match = cleanDesc.match(/^([A-Z\s:]+[A-Z]{3,})(.*)/);
    if (match && match[1].length < 100) {
      const embeddedTitle = match[1].trim();
      const body = match[2].trim();
      // Only treat as embedded title if it's reasonably short and body exists
      if (embeddedTitle && body.length > embeddedTitle.length) {
        return { title: embeddedTitle, body };
      }
    }
    return { title: null, body: cleanDesc };
  };

  const { title: embeddedTitle, body: descriptionBody } = parseDescription(data.description);

  return (
    <div className="container py-4">
      <p><Link to="/events">← Back to events</Link></p>

      <div className="d-flex align-items-center gap-3 mb-3">
        {data.image_url && (
          <img
            src={data.image_url}
            alt=""
            style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 12 }}
          />
        )}
        <div>
          <h1 className="mb-1">{data.name ?? data.title ?? "Event"}</h1>
          <div className="text-muted">
            {[data.city, data.state].filter(Boolean).join(", ") || data.venue}
          </div>
        </div>
      </div>

      {(data.date || startTime || endTime) && (
        <div className="mb-3 d-flex align-items-center gap-2">
          <Badge bg="light" text="dark">
            {data.date ?? "TBD"}
          </Badge>
          {startTime && (
            <>
              <Badge bg="secondary">{startTime}</Badge>
              {endTime && <span className="text-muted">→</span>}
            </>
          )}
          {endTime && (
            <Badge bg="secondary">{endTime}</Badge>
          )}
        </div>
      )}

      {/* Event Description */}
      {data.description && (
        <div className="mb-4">
          {embeddedTitle && (
            <h2 className="h4 fw-bold mb-3 text-primary">{embeddedTitle}</h2>
          )}
          <div className="fs-5 text-dark" style={{ lineHeight: "1.6" }}>
            {descriptionBody}
          </div>
        </div>
      )}

      {/* External URL */}
      {data.external_url && (
        <div className="mb-4">
          <a
            href={data.external_url}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
          >
            Visit Event Page →
          </a>
        </div>
      )}

      {/* Organization Details */}
      {data.organization && (
        <div className="mb-4">
          <h3 className="h5 mb-3">Hosted By</h3>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex gap-3">
                {data.organization.image_url && (
                  <img
                    src={data.organization.image_url}
                    alt=""
                    style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }}
                  />
                )}
                <div className="flex-grow-1">
                  <Link to={`/orgs/${data.organization.id}`} className="text-decoration-none">
                    <h4 className="h6 mb-1">{data.organization.name}</h4>
                  </Link>
                  <div className="small text-muted mb-2">
                    {[data.organization.city, data.organization.state].filter(Boolean).join(", ")}
                  </div>
                  {data.organization.topic && (
                    <Badge bg="info" className="me-2">{data.organization.topic}</Badge>
                  )}
                  {data.organization.size && (
                    <Badge bg="secondary">{data.organization.size}</Badge>
                  )}
                  {data.organization.description && (
                    <p className="small mt-2 mb-0 text-muted">
                      {data.organization.description.slice(0, 250)}
                      {data.organization.description.length > 250 ? "..." : ""}
                    </p>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Related Resources */}
      {data.resources && data.resources.length > 0 && (
        <div className="mb-4">
          <h3 className="h5 mb-3">Related Resources ({data.resources.length})</h3>
          <Row xs={1} md={2} className="g-3">
            {data.resources.map((resource) => (
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
