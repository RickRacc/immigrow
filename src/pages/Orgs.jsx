import data from '../data/orgs.json';
import EntityGrid from '../components/EntityGrid';

export default function Orgs() {
  return (
    <>
      <h1>Search from {data.length} Organizations</h1>
      <EntityGrid
        items={data}
        titleKey="name"
        subtitleFunc={(o) => `${o.city}, ${o.state} | ${o.topic}`}
        linkFunc={(o) => `/orgs/${o.id}`}
        footFunc={(o) => `Founded ${o.foundedYear} • ${o.meetingFrequency}`}
      />
    </>
  );
}
