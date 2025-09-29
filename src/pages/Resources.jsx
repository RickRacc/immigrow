import data from '../data/resources.json';
import EntityGrid from '../components/EntityGrid';

export default function Resources() {
  return (
    <>
      <h1>Search from {data.length} Legal Resources</h1>
      <EntityGrid
        items={data}
        titleKey="title"
        subtitleFunc={(r) => `${r.scope} | ${r.topic}`}
        linkFunc={(r) => `/resources/${r.id}`}
        footFunc={(r) => `Published ${r.published} • ${r.format}`}
      />
    </>
  );
}
