// src/pages/Orgs.jsx
import { useEffect, useState } from "react";
import { Spinner, Alert } from "react-bootstrap";
import { fetchOrgs } from "../lib/api";
import EntityGrid from "../components/EntityGrid";

export default function Orgs() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const data = await fetchOrgs();
        if (cancel) return;

        const rows = (data ?? []).map((o) => ({
          id: o.id,
          title: o.name ?? "Organization",
          imageUrl: o.image_url || o.logo_url || o.logo || null,
          topic: o.topic,
          subtitle: [o.city, o.state].filter(Boolean).join(", "),
          foot: o.meeting_frequency ?? " ",
        }));

        rows.sort((a, b) => (b.imageUrl ? 1 : 0) - (a.imageUrl ? 1 : 0));
        setItems(rows);
      } catch (ex) {
        setErr(ex.message || String(ex));
      } finally {
        setLoading(false);
      }
    })();
    return () => void (cancel = true);
  }, []);

  if (loading) return (<div className="container py-4"><Spinner animation="border" /></div>);
  if (err)      return (<div className="container py-4"><Alert variant="danger">Error loading organizations: {err}</Alert></div>);

  return (
    <EntityGrid
      items={items}
      headerText={`Search from ${items.length} Organizations`}
      linkFunc={(o) => `/orgs/${o.id}`}
      titleKey="title"
      subtitleFunc={(o) => o.subtitle}
      footFunc={(o) => o.foot}
      badgeKey="topic"
      imageKey="imageUrl"
    />
  );
}
