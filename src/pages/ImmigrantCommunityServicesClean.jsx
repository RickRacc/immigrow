import orgsData from '../data/orgs.json';
import eventsData from '../data/events.json';
import resourcesData from '../data/resources.json';

export default function ImmigrantCommunityServices() {
  // Get the specific organization data
  const org = orgsData.find(o => o.id === 'org-1');
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
              <p className="card-text">
                <strong>Location:</strong> {org.city}, {org.state}
              </p>
              <p className="card-text">
                <strong>Focus Area:</strong> {org.topic}
              </p>
              <p className="card-text">
                <strong>Founded:</strong> {org.foundedYear}
              </p>
              <p className="card-text">
                <strong>Meeting Schedule:</strong> {org.meetingFrequency}
              </p>
              <p className="card-text">
                The Immigrant Community & Citizenship Services (ICCS) has been Austin's premier 
                resource for naturalization support since 2014. We provide comprehensive assistance 
                to immigrants seeking U.S. citizenship, including application guidance, test preparation, 
                and ongoing support throughout the naturalization process.
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
                <h5>Upcoming Events</h5>
              </div>
              <div className="card-body">
                {events.map(event => (
                  <div key={event.id} className="mb-3">
                    <img 
                      src={event.imageUrl} 
                      className="img-fluid rounded mb-2" 
                      alt={event.title}
                      style={{ maxHeight: '150px', width: '100%', objectFit: 'cover' }}
                    />
                    <h6 className="card-title">{event.title}</h6>
                    <p className="card-text small">
                      <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}<br/>
                      <strong>Location:</strong> {event.location}<br/>
                      <strong>Duration:</strong> {event.durationMins} minutes
                    </p>
                    <a href={`/events/${event.id}`} target="_blank" className="btn btn-outline-primary btn-sm">
                      View Event Details
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
                    <img 
                      src={resource.imageUrl} 
                      className="img-fluid rounded mb-2" 
                      alt={resource.title}
                      style={{ maxHeight: '100px', width: '100%', objectFit: 'cover' }}
                    />
                    <h6 className="card-title">{resource.title}</h6>
                    <p className="card-text small">
                      <strong>Topic:</strong> {resource.topic}<br/>
                      <strong>Format:</strong> {resource.format}<br/>
                      <strong>Published:</strong> {new Date(resource.published).toLocaleDateString()}
                    </p>
                    <a href={`/resources/${resource.id}`} target="_blank" className="btn btn-outline-secondary btn-sm">
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