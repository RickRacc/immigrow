import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container py-5">
      {/* Hero Section */}
      <header className="text-center mb-5">
        <h1 className="display-5 fw-bold text-success">Immigrow</h1>
        <p className="lead text-muted mx-auto" style={{ maxWidth: 820 }}>
          Immigrow is a community-driven platform built to support immigrants and their allies.
          We connect you to trustworthy organizations, upcoming events, and practical resources
          that help with everything from legal guidance to cultural engagement.
        </p>

        {/* Color-coded Buttons */}
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          {/* Events Button (Blue) */}
          <Link
            className="btn px-4 py-2 fs-5 shadow-sm"
            style={{
              backgroundColor: "#2196f3",
              color: "white",
              border: "none",
            }}
            to="/events"
          >
            See Events
          </Link>

          {/* Organizations Button (Teal) */}
          <Link
            className="btn px-4 py-2 fs-5 shadow-sm"
            style={{
              backgroundColor: "#009688", // teal (different from Immigrow title)
              color: "white",
              border: "none",
            }}
            to="/orgs"
          >
            Explore Organizations
          </Link>

          {/* Resources Button (Yellow) */}
          <Link
            className="btn px-4 py-2 fs-5 shadow-sm"
            style={{
              backgroundColor: "#fbc02d",
              color: "#212529",
              border: "none",
            }}
            to="/resources"
          >
            Find Resources
          </Link>
        </div>
      </header>

      {/* Image Collage */}
      <section aria-label="Community photos from Austin" className="mb-5">
        <div className="row g-3">
          <div className="col-6 col-md-3">
            <img
              src="/images/home/austin-1.jpg"
              alt="Community gathering in Austin"
              className="img-fluid rounded-3 w-100 h-100 object-fit-cover"
            />
          </div>
          <div className="col-6 col-md-3">
            <img
              src="/images/home/austin-2.jpg"
              alt="Family at an event in Austin"
              className="img-fluid rounded-3 w-100 h-100 object-fit-cover"
            />
          </div>
          <div className="col-6 col-md-3">
            <img
              src="/images/home/austin-3.jpg"
              alt="Volunteers assisting immigrants"
              className="img-fluid rounded-3 w-100 h-100 object-fit-cover"
            />
          </div>
          <div className="col-6 col-md-3">
            <img
              src="/images/home/austin-4.jpg"
              alt="Austin skyline representing community"
              className="img-fluid rounded-3 w-100 h-100 object-fit-cover"
            />
          </div>
        </div>
      </section>

      {/* Site Overview */}
      <section className="mx-auto" style={{ maxWidth: 900 }}>
        <h2 className="h4 fw-semibold mb-3">What you’ll find here</h2>
        <p className="mb-1">You can navigate through our site to explore:</p>
        <ul>
          <li>
            <strong>Organizations</strong>: providing direct support and community connections
          </li>
          <li>
            <strong>Events</strong>: workshops, cultural festivals, and legal clinics
          </li>
          <li>
            <strong>Resources</strong>: multilingual guides, “Know Your Rights” materials, and more
          </li>
        </ul>
      </section>
    </div>
  );
}
