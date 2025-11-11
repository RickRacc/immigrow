import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchEventById } from "../lib/api";

export default function EventDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const ev = await fetchEventById(id);
        if (!cancel) setData(ev);
      } catch (e) {
        if (!cancel) setErr(e.message || String(e));
      }
    })();
    return () => { cancel = true; };
  }, [id]);

  if (err) return <div className="container my-4 alert alert-danger">Error: {err}</div>;
  if (!data) return <div className="container my-4">Loading…</div>;

  const fallback = "/images/home/austin-2.jpg";
  const img = data.imageUrl || fallback;

  return (
    <div className="container my-4" style={{ maxWidth: 900 }}>
      <p className="mb-3"><Link to="/events">← Back to events</Link></p>
      <div className="d-flex gap-4">
        <img
          src={img}
          alt={data.title}
          style={{ width: 280, height: 180, objectFit: "cover", borderRadius: 12 }}
          onError={(e) => { e.currentTarget.src = fallback; }}
        />
        <div>
          <h1 className="h3 fw-semibold">{data.title}</h1>
          <div className="text-muted mb-2">
            {[data.date, data.location].filter(Boolean).join(" · ")}
          </div>
          {data.description && <p className="mb-2">{data.description}</p>}
          {data.url && (
            <a className="btn btn-outline-primary btn-sm" href={data.url} target="_blank" rel="noreferrer">
              Event page
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
