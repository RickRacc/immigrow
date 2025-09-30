import orgsData from '../data/orgs.json';
import eventsData from '../data/events.json';
import resourcesData from '../data/resources.json';

export default function ESLCommunityClub() {
  const org = orgsData.find(o => o.id === 'org-3');
  const events = eventsData.filter(e => org.eventIds.includes(e.id));
  const resources = resourcesData.filter(r => org.resourceIds.includes(r.id));

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          <h1>{org.name}</h1>
          
          <div className="card mb-4">
            <img 
              src={org.imageUrl} 
              className="card-img-top" 
              alt={org.name}
              style={{ maxHeight: '400px', objectFit: 'cover' }}
            />
            <div className="card-body">
              <h5 className="card-title">About Our Organization</h5>
              <p><strong>Location:</strong> {org.city}, {org.state}</p>
              <p><strong>Focus Area:</strong> {org.topic}</p>
              <p><strong>Founded:</strong> {org.foundedYear}</p>
              <p><strong>Meeting Schedule:</strong> {org.meetingFrequency}</p>
              <p>
                The ESL Community Club creates a supportive environment for English language 
                learners in Austin. We focus on practical conversation skills and community 
                building through biweekly meetings and activities.
              </p>
              <a href={org.externalUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                Visit Our Website
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          {events.length > 0 && (
            <div className="card mb-3">
              <div className="card-header">
                <h5>Our Events</h5>
              </div>
              <div className="card-body">
                {events.map(event => (
                  <div key={event.id} className="mb-3">
                    <h6>{event.title}</h6>
                    <p className="small">
                      <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}<br/>
                      <strong>Location:</strong> {event.location}
                    </p>
                    <a href={`/events/${event.id}`} className="btn btn-outline-primary btn-sm">
                      View Event
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resources.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h5>Our Resources</h5>
              </div>
              <div className="card-body">
                {resources.map(resource => (
                  <div key={resource.id} className="mb-3">
                    <h6>{resource.title}</h6>
                    <p className="small">
                      <strong>Topic:</strong> {resource.topic}<br/>
                      <strong>Format:</strong> {resource.format}
                    </p>
                    <a href={`/resources/${resource.id}`} className="btn btn-outline-secondary btn-sm">
                      View Resource
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}