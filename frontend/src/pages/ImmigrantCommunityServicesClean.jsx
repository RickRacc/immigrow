// src/pages/Home.jsx
import { Link, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Form, InputGroup, Card } from "react-bootstrap";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  function goSearch(e) {
    e.preventDefault();
    // simple: send users to Events for now (adjust to a unified search route if you add one)
    navigate(`/events?query=${encodeURIComponent(q)}`);
  }

  return (
    <>
      {/* HERO */}
      <section className="hero-wrap py-5 py-md-6 mb-4">
        <Container>
          <Row className="align-items-center">
            <Col md={7} className="mb-4 mb-md-0">
              <h1 className="display-5 fw-bold mb-3">
                Connect with events, organizations, and resources — all in one place.
              </h1>
              <p className="lead text-muted mb-4">
                Browse local community events, find trusted organizations, and explore helpful guides.
              </p>

              <Form onSubmit={goSearch}>
                <InputGroup className="home-search">
                  <Form.Control
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search events, orgs, or resources…"
                  />
                  <Button type="submit" variant="success">Search</Button>
                </InputGroup>
              </Form>

              <div className="d-flex gap-2 mt-3">
                <Button as={Link} to="/events" variant="outline-primary">Explore Events</Button>
                <Button as={Link} to="/orgs" variant="outline-teal">Find Organizations</Button>
                <Button as={Link} to="/resources" variant="outline-warning">View Resources</Button>
              </div>
            </Col>

            <Col md={5}>
              <div className="hero-card shadow rounded-4 overflow-hidden">
                {/* Replace the image path with your own if desired */}
                <img
                  src="/images/hero.jpg"
                  alt="Community"
                  style={{ width: "100%", height: 280, objectFit: "cover" }}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* THREE FEATURE CARDS */}
      <Container className="mb-5">
        <Row xs={1} md={3} className="g-4">
          <Col>
            <Card className="h-100 shadow-sm border-0 rounded-4">
              <Card.Body>
                <div className="badge bg-primary-subtle text-primary mb-2">Events</div>
                <Card.Title className="fw-semibold">Stay up to date</Card.Title>
                <Card.Text className="text-muted">
                  Find workshops, clinics, and meetups happening near you.
                </Card.Text>
                <Button as={Link} to="/events" variant="link" className="p-0">
                  Browse events →
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col>
            <Card className="h-100 shadow-sm border-0 rounded-4">
              <Card.Body>
                <div className="badge bg-teal-subtle text-teal mb-2">Organizations</div>
                <Card.Title className="fw-semibold">Trusted groups</Card.Title>
                <Card.Text className="text-muted">
                  Discover local orgs by topic, city, and services offered.
                </Card.Text>
                <Button as={Link} to="/orgs" variant="link" className="p-0">
                  Find organizations →
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col>
            <Card className="h-100 shadow-sm border-0 rounded-4">
              <Card.Body>
                <div className="badge bg-warning-subtle text-warning mb-2">Resources</div>
                <Card.Title className="fw-semibold">Learn & prepare</Card.Title>
                <Card.Text className="text-muted">
                  Read guides and checklists to navigate key processes.
                </Card.Text>
                <Button as={Link} to="/resources" variant="link" className="p-0">
                  Explore resources →
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
