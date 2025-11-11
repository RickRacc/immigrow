import { useEffect, useState } from "react";
import EntityGrid from "../components/EntityGrid";
import { fetchEvents } from "../lib/api";

export default function Events() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const events = await fetchEvents();
        if (!cancel) setRows(events);
      } catch (e) {
        if (!cancel) setErr(e.message || String(e));
      }
    })();
    return () => { cancel = true; };
  }, []);

  if (err) return <div className="alert alert-danger mt-3">Error loading events: {err}</div>;

  return (
    <div className="container my-4">
      <h2 className="mb-3">Events</h2>
      <EntityGrid
        items={rows}
        linkFunc={(e) => `/events/${e.id}`}
        titleKey="title"
        subtitleFunc={(e) => [e.date, e.location].filter(Boolean).join(" · ")}
        imageKey="imageUrl"
        fallbackImage="/images/home/austin-1.jpg"
      />
    </div>
  );
}
