import resourcesData from '../data/resources.json';
import orgsData from '../data/orgs.json';
import eventsData from '../data/events.json';

export default function BeginnerESLGuide() {
  const resource = resourcesData.find(r => r.id === 'res-3');
  const orgs = orgsData.filter(o => resource.orgIds.includes(o.id));
  const relatedEvents = eventsData.filter(e => orgs.some(org => org.eventIds.includes(e.id)));

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8">
          <h1>{resource.title}</h1>
          
          <div className="card mb-4">
            <img src={resource.imageUrl} className="card-img-top" alt={resource.title} style={{ maxHeight: '400px', objectFit: 'cover' }} />
            <div className="card-body">
              <h5>Resource Details</h5>
              <p><strong>Topic:</strong> {resource.topic}</p>
              <p><strong>Scope:</strong> {resource.scope}</p>
              <p><strong>Format:</strong> {resource.format}</p>
              <p><strong>Published:</strong> {new Date(resource.published).toLocaleDateString()}</p>
              <h5>About This Resource</h5>
              <p>The Beginner ESL Guide is a comprehensive, locally-focused educational resource designed specifically for English language learners in the Austin community.</p>
              <a href={resource.externalUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">Access Resource</a>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header"><h5>Provided By</h5></div>
            <div className="card-body">
              {orgs.map(org => (
                <div key={org.id} className="mb-3">
                  <h6>{org.name}</h6>
                  <p><strong>Focus:</strong> {org.topic}</p>
                  <a href={`/orgs/${org.id}`} className="btn btn-sm btn-outline-primary">View Organization</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}