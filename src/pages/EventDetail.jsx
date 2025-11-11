import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Alert, Spinner, Badge } from "react-bootstrap";
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

      {(data.date || data.start_time || data.end_time) && (
        <div className="mb-3">
          <Badge bg="light" text="dark" className="me-2">
            {data.date ?? "TBD"}
          </Badge>
          {data.start_time && (
            <Badge bg="secondary" className="me-2">{data.start_time}</Badge>
          )}
          {data.end_time && (
            <Badge bg="secondary">{data.end_time}</Badge>
          )}
        </div>
      )}

      {data.description && <p className="mb-4">{data.description}</p>}

      {orgId && (
        <p className="mt-3">
          Hosted by{" "}
          <Link to={`/orgs/${orgId}`} className="fw-semibold">
            Organization #{orgId}
          </Link>
        </p>
      )}

      {data.url && (
        <p className="mt-2">
          <a href={data.url} target="_blank" rel="noreferrer">
            Event website
          </a>
        </p>
      )}
    </div>
  );
}
