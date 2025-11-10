// src/pages/Orgs.jsx
import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { fetchOrganizations } from "../lib/api";
import EntityGrid from "../components/EntityGrid"; // ⬅️ make sure this path matches where you saved it

export default function Orgs() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const data = await fetchOrganizations();
        if (!cancel) setItems(data || []);
      } catch (e) {
        if (!cancel) setErr(e?.message || String(e));
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  // normalize to the shape EntityGrid expects
  const norm = (u) => (u?.startsWith("//") ? `https:${u}` : u);
  const rows = (items || []).map((o) => ({
    id: o.id,
    name: o.name,
    city: o.city,
    state: o.state,
    topic: o.topic,
    meeting: o.meeting_frequency ?? "N/A",
    imageUrl:
      norm(o.image_url || o.logo_url || o.logo) || "/images/orgs/default.jpg",
  }));

  if (err) {
    return (
      <Container className="py-4">
        <div className="alert alert-danger">Error: {err}</div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Search from {rows.length} Organizations</h2>

      <EntityGrid
        items={rows}
        linkFunc={(o) => `/orgs/${o.id}`}
        titleKey="name"
        subtitleFunc={(o) =>
          `${o.city}${o.state ? `, ${o.state}` : ""}${o.topic ? ` | ${o.topic}` : ""}`
        }
        footFunc={(o) => o.meeting}
        imageKey="imageUrl"
        fallbackImage="/images/orgs/default.jpg"
      />
    </Container>
  );
}
