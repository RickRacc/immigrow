import eventsData from '../data/events.json';
import orgsData from '../data/orgs.json';
import resourcesData from '../data/resources.json';

export default function ESLCommunityMeetup() {
    // Get the specific event data
    const event = eventsData.find(e => e.id === 'evt-3');
    const org = orgsData.find(o => o.id === event.orgId);
    const resources = resourcesData.filter(r => event.resourceIds.includes(r.id));

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-8">
                    <h1>{event.title}</h1>

                    <div className="card mb-4">
                        <img
                            src={event.imageUrl}
                            className="card-img-top"
                            alt={event.title}
                            style={{ maxHeight: '400px', objectFit: 'cover' }}
                        />
                        <div className="card-body">
                            <h5 className="card-title">Event Details</h5>
                            <p className="card-text">
                                <strong>Date:</strong> {new Date(event.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                            <p className="card-text">
                                <strong>Location:</strong> {event.location}
                            </p>
                            <p className="card-text">
                                <strong>Duration:</strong> {event.durationMins} minutes
                            </p>
                            <p className="card-text">
                                Join our welcoming ESL Community Meetup where English language learners come together
                                to practice conversation skills, share experiences, and build lasting friendships.
                                This casual, supportive environment is perfect for learners of all levels. We focus on
                                practical English skills, cultural exchange, and community building through interactive
                                activities and group discussions.
                            </p>
                            <a href={event.externalUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                                Register for Event
                            </a>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    {/* Organization Information */}
                    <div className="card mb-3">
                        <div className="card-header">
                            <h5>Hosted By</h5>
                        </div>
                        <div className="card-body">
                            <img
                                src={org.imageUrl}
                                className="img-fluid rounded mb-2"
                                alt={org.name}
                                style={{ maxHeight: '150px', width: '100%', objectFit: 'cover' }}
                            />
                            <h6 className="card-title">{org.name}</h6>
                            <p className="card-text">
                                <strong>Focus:</strong> {org.topic}<br />
                                <strong>Founded:</strong> {org.foundedYear}<br />
                                <strong>Meetings:</strong> {org.meetingFrequency}<br />
                                <strong>Location:</strong> {org.city}, {org.state}
                            </p>
                            <a href={org.externalUrl} className="btn btn-outline-primary btn-sm" target="_blank" rel="noopener noreferrer">
                                Learn More
                            </a>
                        </div>
                    </div>

                    {/* Related Resources */}
                    <div className="card">
                        <div className="card-header">
                            <h5>Related Resources</h5>
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
                                        <strong>Topic:</strong> {resource.topic}<br />
                                        <strong>Format:</strong> {resource.format}<br />
                                        <strong>Published:</strong> {new Date(resource.published).toLocaleDateString()}
                                    </p>
                                    <a href={resource.externalUrl} className="btn btn-outline-secondary btn-sm" target="_blank" rel="noopener noreferrer">
                                        Access Resource
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}