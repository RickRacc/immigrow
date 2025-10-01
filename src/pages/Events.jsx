import data from '../data/events.json'
import EntityGrid from '../components/EntityGrid'

export default function Events() {
  return (
    <>
      <h1>Search from {data.length} Events </h1>
      <EntityGrid 
          items={data} 
          titleKey="title" 
          subtitleFunc={(e) => `${e.date} | ${e.location}`} 
          linkFunc={(e) => `/events/${e.id}`} 
          footFunc={(e) => `${e.durationMins} min | start: ${e.startTime}`}
      />
    </>
  )
}