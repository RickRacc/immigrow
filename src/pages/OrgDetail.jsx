// src/pages/OrgDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Spinner, Alert, Badge } from "react-bootstrap";
import { fetchOrgById, fetchEventsByOrg } from "../lib/api";

export default function OrgDetail() {
  const { id } = useParams();
  const [org, setOrg] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [o, ev] = await Promise.all([
          fetchOrgById(id),
          fetchEventsByOrg(id),
        ]);
        if (cancel) return;
        setOrg(o);
        setEvents(ev);
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
    <div className="container py-3">
      <p><Link to="/organizations">&larr; Back to organizations</Link></p>
      <h1 className="mb-2">{org.name}</h1>
      <div className="text-muted mb-3">
        {[org.city, org.state].filter(Boolean).join(", ")}
      </div>
      {org.topic && <Badge bg="secondary">{org.topic}</Badge>}

      <hr className="my-4" />
      <h4>Events</h4>
      {events.length === 0 ? (
        <div className="text-muted">No events linked.</div>
      ) : (
        <ul className="mt-2">
          {events.map(e => (
            <li key={e.id}>
              <Link to={`/events/${e.id}`}>{e.title ?? e.name ?? `Event #${e.id}`}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
