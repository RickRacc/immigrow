// src/pages/Events.jsx
import { useEffect, useState } from "react";
import { Spinner, Alert } from "react-bootstrap";
import { fetchEvents } from "../lib/api";
import EntityGrid from "../components/EntityGrid";

export default function Events() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const data = await fetchEvents();
        if (cancel) return;

        const rows = (data ?? []).map((e) => ({
          id: e.id,
          title: e.name ?? e.title ?? "Untitled event",
          imageUrl: e.image_url || e.imageUrl || e.image || null,
          subtitle: [e.city, e.state].filter(Boolean).join(", ") || e.venue || "",
          foot: [e.date, e.start_time && `• ${e.start_time}`].filter(Boolean).join(" "),
        }));

        // show cards with images first
        rows.sort((a, b) => {
          const ai = a.imageUrl ? 1 : 0;
          const bi = b.imageUrl ? 1 : 0;
          return bi - ai;
        });

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
  if (err)      return (<div className="container py-4"><Alert variant="danger">Error loading events: {err}</Alert></div>);

  return (
    <EntityGrid
      items={items}
      headerText={`Search from ${items.length} Events`}
      linkFunc={(e) => `/events/${e.id}`}
      titleKey="title"
      subtitleFunc={(e) => e.subtitle}
      footFunc={(e) => e.foot}
      imageKey="imageUrl"
    />
  );
}
