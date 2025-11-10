import { Container, Nav, Navbar } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <>
      <Navbar
        bg="light"
        expand="md"
        sticky="top"
        className="border-bottom navbar-immigrow"
      >
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold">
            Immigrow
            </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav">
            <Nav className="ms-auto">
              <Nav.Link as={NavLink} to="/events" className="nav-events">
                Events
              </Nav.Link>
              <Nav.Link as={NavLink} to="/orgs" className="nav-orgs">
                Organizations
              </Nav.Link>
              <Nav.Link as={NavLink} to="/resources" className="nav-resources">
                Resources
              </Nav.Link>
              <Nav.Link as={NavLink} to="/about" className="nav-about">
                About
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-4">{children}</Container>

      <footer className="border-top py-3 text-center text-muted">
        © {new Date().getFullYear()} Immigrow
      </footer>
    </>
  );
}
