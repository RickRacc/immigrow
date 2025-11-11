import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Row, Col, Card, Badge, Spinner, Alert } from "react-bootstrap";
import { fetchOrgById, fetchEventsByOrg, fetchResourcesByOrg } from "../lib/api";

export default function OrgDetail() {
  const { id } = useParams();
  const cleanId = String(id).replace(/^org-/, "");
  const [org, setOrg] = useState(null);
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [o, evts, res] = await Promise.all([
          fetchOrgById(cleanId),
          fetchEventsByOrg(cleanId),
          fetchResourcesByOrg(cleanId),
        ]);

        if (cancel) return;

        // Sort events: entries with images first
        const sortedEvents = [...(evts ?? [])].sort((a, b) => {
          const hasA = Boolean(a.image_url || a.imageUrl);
          const hasB = Boolean(b.image_url || b.imageUrl);
          return hasA === hasB ? 0 : hasA ? -1 : 1;
        });

        setOrg(o);
        setEvents(sortedEvents);
        setResources(res ?? []);
      } catch (e) {
        setErr(e.message || String(e));
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [cleanId]);

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
  if (!org) {
    return (
      <div className="container py-4">
        <Alert variant="warning">Organization not found.</Alert>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <p><Link to="/orgs">← Back to organizations</Link></p>

      <div className="d-flex align-items-center gap-3 mb-3">
        {org.image_url && (
          <img
            src={org.image_url}
            alt=""
            style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 12 }}
          />
        )}
        <div>
          <h1 className="mb-1">{org.name}</h1>
          <div className="text-muted">
            {[org.city, org.state].filter(Boolean).join(", ")}
            {org.topic && <> · <Badge bg="info" text="dark">{org.topic}</Badge></>}
          </div>
        </div>
      </div>

      {org.description && <p className="mb-4">{org.description}</p>}

      {/* Events section */}
      <h2 className="mt-4 mb-3">Events <small className="text-muted">({events.length})</small></h2>
      {events.length === 0 ? (
        <div className="text-muted mb-4">No events for this organization yet.</div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-3 mb-4">
          {events.map((e) => {
            const img = e.image_url || e.imageUrl || "";
            return (
              <Col key={e.id}>
                <Link to={`/events/${e.id}`} className="text-reset text-decoration-none">
                  <Card className="h-100 shadow-sm border-0 rounded-4 position-relative">
                    {img && (
                      <Card.Img
                        variant="top"
                        src={img}
                        alt=""
                        style={{ objectFit: "cover", height: 200 }}
                      />
                    )}
                    <Card.Body>
                      <Card.Title className="h5">{e.name ?? e.title ?? "Untitled event"}</Card.Title>
                      <div className="small text-muted">
                        {[e.city, e.state].filter(Boolean).join(", ") || e.venue}
                      </div>
                      {(e.date || e.start_time) && (
                        <div className="small mt-1">
                          {[e.date, e.start_time && `• ${e.start_time}`]
                            .filter(Boolean)
                            .join(" ")}
                        </div>
                      )}
                    </Card.Body>
                    <span className="stretched-link" />
                  </Card>
                </Link>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Resources section */}
      <h2 className="mt-4 mb-3">Resources <small className="text-muted">({resources.length})</small></h2>
      {resources.length === 0 ? (
        <div className="text-muted">No resources for this organization yet.</div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-3">
          {resources.map((r) => {
            const img = r.image_url || r.imageUrl || "/images/resources/default.jpg";
            return (
              <Col key={r.id}>
                <Link to={`/resources/${r.id}`} className="text-reset text-decoration-none">
                  <Card className="h-100 shadow-sm border-0 rounded-4 position-relative">
                    {img && (
                      <Card.Img
                        variant="top"
                        src={img}
                        alt=""
                        style={{ objectFit: "cover", height: 180 }}
                      />
                    )}
                    <Card.Body>
                      <Card.Title className="h6">{r.title}</Card.Title>
                      <div className="small text-muted">
                        {[r.topic, r.scope].filter(Boolean).join(" · ")}
                      </div>
                    </Card.Body>
                    <span className="stretched-link" />
                  </Card>
                </Link>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
}
