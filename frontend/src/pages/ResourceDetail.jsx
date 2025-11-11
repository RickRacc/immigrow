// src/pages/ResourceDetail.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Alert, Button, Badge } from "react-bootstrap";
import { fetchResourceById } from "../lib/api";
import { ArrowUpRight } from "lucide-react"; // lucide-react is available per canvas rules

function ExtLink({ href, children }) {
  if (!href) return null;
  return (
    <Button
      as="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="me-2 mt-2"
    >
      {children} <ArrowUpRight size={16} className="ms-1" />
    </Button>
  );
}

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

  const metaLine = [
    data.topic && <Badge key="topic" bg="warning" text="dark" className="me-2">{data.topic}</Badge>,
    data.scope && <span key="scope">{data.scope}</span>,
  ];

  const detailsLine = [
    data.court_name,
    data.citation,
    data.docket_number && `Docket ${data.docket_number}`,
    data.date_published && `Filed ${data.date_published}`,
  ].filter(Boolean).join(" · ");

  return (
    <div className="container py-4">
      <p className="mb-3"><Link to="/resources">← Back to resources</Link></p>

      <h1 className="mb-2">{data.title ?? `Resource ${id}`}</h1>
      <div className="mb-2">{metaLine}</div>

      {detailsLine && <p className="text-muted">{detailsLine}</p>}
      {data.description && <p style={{ whiteSpace: "pre-wrap" }}>{data.description}</p>}

      <div className="mt-3">
        <ExtLink href={data.external_url}>Open external link</ExtLink>
        {/* If you later add more URLs, show them here the same way */}
      </div>
    </div>
  );
}
