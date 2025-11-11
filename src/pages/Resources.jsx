// src/pages/Resources.jsx
import { useEffect, useState } from "react";
import { Spinner, Alert } from "react-bootstrap";
import { fetchResources } from "../lib/api";
import EntityGrid from "../components/EntityGrid";

export default function Resources() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const data = await fetchResources();
        if (cancel) return;

        const rows = (data ?? []).map((r) => ({
          id: r.id,
          title: r.title ?? "Untitled",
          topic: r.topic ?? "Immigration Law",
          imageUrl: r.image_url || r.imageUrl || r.image || null,
          subtitle:
            [r.court_name, r.scope].filter(Boolean).join(" · ") || r.court_name || r.scope || "",
          foot: [
            r.citation,
            r.docket_number && `Docket: ${r.docket_number}`,
            r.date_published && `Filed: ${r.date_published}`,
          ]
            .filter(Boolean)
            .join(" · "),
        }));

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
  if (err)      return (<div className="container py-4"><Alert variant="danger">Error: {err}</Alert></div>);

  return (
    <EntityGrid
      items={items}
      headerText={`Search from ${items.length} Resources`}
      linkFunc={(r) => `/resources/${r.id}`}
      titleKey="title"
      subtitleFunc={(r) => r.subtitle}
      footFunc={(r) => r.foot}
      imageKey="imageUrl"
      badgeKey="topic"
    />
  );
}
