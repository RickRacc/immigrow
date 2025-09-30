import resourcesData from '../data/resources.json';import resourcesData from '../data/resources.json';

import orgsData from '../data/orgs.json';import orgsData from '../data/orgs.json';

import eventsData from '../data/events.json';import eventsData from '../data/events.json';



export default function N400NaturalizationChecklist() {export default function N400NaturalizationChecklist() {

  const resource = resourcesData.find(r => r.id === 'res-1');  // Get the specific resource data

  const orgs = orgsData.filter(o => resource.orgIds.includes(o.id));  const resource = resourcesData.find(r => r.id === 'res-1');

  const relatedEvents = eventsData.filter(e => orgs.some(org => org.eventIds.includes(e.id)));  const orgs = orgsData.filter(o => resource.orgIds.includes(o.id));

  const relatedEvents = eventsData.filter(e => orgs.some(org => org.eventIds.includes(e.id)));

  return (

    <div className="container mt-4">  return (

      <div className="row">    <div className="container mt-4">

        <div className="col-md-8">      <div className="row">

          <h1>{resource.title}</h1>        <div className="col-md-8">

                    <h1>{resource.title}</h1>

          <div className="card mb-4">          

            <img           <div className="card mb-4">

              src={resource.imageUrl}             <img 

              className="card-img-top"               src={resource.imageUrl} 

              alt={resource.title}              className="card-img-top" 

              style={{ maxHeight: '400px', objectFit: 'cover' }}              alt={resource.title}

            />              style={{ maxHeight: '400px', objectFit: 'cover' }}

            <div className="card-body">            />

              <h5 className="card-title">Resource Details</h5>            <div className="card-body">

              <p><strong>Topic:</strong> {resource.topic}</p>              <h5 className="card-title">Resource Details</h5>

              <p><strong>Scope:</strong> {resource.scope}</p>              <p className="card-text">

              <p><strong>Format:</strong> {resource.format}</p>                <strong>Topic:</strong> {resource.topic}

              <p><strong>Published:</strong> {new Date(resource.published).toLocaleDateString()}</p>              </p>

                            <p className="card-text">

              <h5 className="mt-4">About This Resource</h5>                <strong>Scope:</strong> {resource.scope}

              <p>              </p>

                The N-400 Naturalization Checklist is an essential federal resource designed to guide               <p className="card-text">

                immigrants through the U.S. citizenship application process. This comprehensive PDF                 <strong>Format:</strong> {resource.format}

                checklist ensures that applicants have all necessary documentation and meet all               </p>

                requirements before submitting their naturalization application.              <p className="card-text">

              </p>                <strong>Published:</strong> {new Date(resource.published).toLocaleDateString('en-US', { 

              <p>                  year: 'numeric', 

                This step-by-step guide covers everything from eligibility requirements to document                   month: 'long', 

                preparation, helping applicants avoid common mistakes that could delay their citizenship                   day: 'numeric' 

                process.                })}

              </p>              </p>

                            

              <a href={resource.externalUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">              <h5 className="mt-4">About This Resource</h5>

                Access Resource              <p className="card-text">

              </a>                The N-400 Naturalization Checklist is an essential federal resource designed to guide 

            </div>                immigrants through the U.S. citizenship application process. This comprehensive PDF 

          </div>                checklist ensures that applicants have all necessary documentation and meet all 

        </div>                requirements before submitting their naturalization application.

              </p>

        <div className="col-md-4">              <p className="card-text">

          {orgs.length > 0 && (                This step-by-step guide covers everything from eligibility requirements to document 

            <div className="card mb-3">                preparation, helping applicants avoid common mistakes that could delay their citizenship 

              <div className="card-header">                process. The checklist includes detailed instructions for gathering supporting documents, 

                <h5>Provided By</h5>                preparing for the naturalization test, and understanding the interview process.

              </div>              </p>

              <div className="card-body">              <p className="card-text">

                {orgs.map(org => (                As a federal resource, this checklist is based on the most current USCIS guidelines 

                  <div key={org.id} className="mb-3">                and regulations. It's an invaluable tool for anyone beginning their journey toward 

                    <h6>{org.name}</h6>                U.S. citizenship, providing clarity and confidence throughout the naturalization process.

                    <p className="small">              </p>

                      <strong>Focus:</strong> {org.topic}<br/>              

                      <strong>Location:</strong> {org.city}, {org.state}              <div className="d-grid gap-2 d-md-flex justify-content-md-start">

                    </p>                <a href={resource.externalUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">

                    <a href={`/orgs/${org.id}`} className="btn btn-outline-primary btn-sm">                  Access Resource

                      View Organization                </a>

                    </a>                <a href={resource.externalUrl} className="btn btn-outline-secondary" target="_blank" rel="noopener noreferrer">

                  </div>                  Download PDF

                ))}                </a>

              </div>              </div>

            </div>            </div>

          )}          </div>

        </div>

          {relatedEvents.length > 0 && (

            <div className="card">        <div className="col-md-4">

              <div className="card-header">          {/* Related Organizations */}

                <h5>Related Events</h5>          {orgs.length > 0 && (

              </div>            <div className="card mb-3">

              <div className="card-body">              <div className="card-header">

                {relatedEvents.map(event => (                <h5>Provided By</h5>

                  <div key={event.id} className="mb-3">              </div>

                    <h6>{event.title}</h6>              <div className="card-body">

                    <p className="small">                {orgs.map(org => (

                      <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}<br/>                  <div key={org.id} className="mb-3">

                      <strong>Location:</strong> {event.location}                    <img 

                    </p>                      src={org.imageUrl} 

                    <a href={`/events/${event.id}`} className="btn btn-outline-secondary btn-sm">                      className="img-fluid rounded mb-2" 

                      View Event                      alt={org.name}

                    </a>                      style={{ maxHeight: '150px', width: '100%', objectFit: 'cover' }}

                  </div>                    />

                ))}                    <h6 className="card-title">{org.name}</h6>

              </div>                    <p className="card-text small">

            </div>                      <strong>Focus:</strong> {org.topic}<br/>

          )}                      <strong>Location:</strong> {org.city}, {org.state}<br/>

        </div>                      <strong>Founded:</strong> {org.foundedYear}

      </div>                    </p>

    </div>                    <a href={`/orgs/${org.id}`} className="btn btn-outline-primary btn-sm">

  );                      View Organization

}                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Events */}
          {relatedEvents.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h5>Related Events</h5>
              </div>
              <div className="card-body">
                {relatedEvents.map(event => (
                  <div key={event.id} className="mb-3">
                    <img 
                      src={event.imageUrl} 
                      className="img-fluid rounded mb-2" 
                      alt={event.title}
                      style={{ maxHeight: '100px', width: '100%', objectFit: 'cover' }}
                    />
                    <h6 className="card-title">{event.title}</h6>
                    <p className="card-text small">
                      <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}<br/>
                      <strong>Location:</strong> {event.location}<br/>
                      <strong>Duration:</strong> {event.durationMins} minutes
                    </p>
                    <a href={`/events/${event.id}`} className="btn btn-outline-secondary btn-sm">
                      View Event
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