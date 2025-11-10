import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchEvents } from '../lib/api';
import EntityGrid from '../components/EntityGrid';

export default function Events() {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetchEvents().then(setItems).catch(e => setErr(e.message));
  }, []);

  if (err) return <div className="alert alert-danger">Error loading events: {err}</div>;
  if (!items) return <div>Loading events…</div>;

  // map minimal backend shape -> grid fields
  const rows = items.map(e => ({
    id: e.id,
    title: e.name ?? `Event ${e.id}`,
    date: e.date,
    location: e.location,
    durationMins: e.duration_mins ?? e.durationMins ?? '',
    startTime: e.start_time ?? e.startTime ?? '',
    imageUrl: e.image_url ?? '/images/events/default.jpg',
  }));

  return (
    <>
      <h1>Search from {rows.length} Events</h1>
      <EntityGrid
        items={rows}
        titleKey="title"
        subtitleFunc={(e) => `${e.date ?? 'TBD'} | ${e.location ?? 'TBD'}`}
        linkFunc={(e) => `/events/${e.id}`}
        footFunc={(e) => `${e.durationMins || '—'} min • start: ${e.startTime || '—'}`}
      />
    </>
  );
}
