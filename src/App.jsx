import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";
import Orgs from "./pages/Orgs";
import Resources from "./pages/Resources";


export default function App() {
  return (
    <>
      <BrowserRouter>
        <nav style={{ padding: 16 }}>
          <Link to="/">Home</Link>{" | "}
          <Link to="/about">About</Link>{" | "}
          <Link to="/events">Events</Link>{" | "}
          <Link to="/orgs">Organizations</Link>{" | "}
          <Link to="/resources">Resources</Link>
        </nav>
        <div className="container-fluid px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/events" element={<Events />} />
            <Route path="/orgs" element={<Orgs />} />
            <Route path="/resources" element={<Resources />} />
          </Routes>
        </div>
      </BrowserRouter>


    </>

  );
}
