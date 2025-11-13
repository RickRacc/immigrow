import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";
import Orgs from "./pages/Orgs";
import Resources from "./pages/Resources";
import Search from "./pages/Search";

// detail pages
import EventDetail from "./pages/EventDetail";
import OrgDetail from "./pages/OrgDetail";
import ResourceDetail from "./pages/ResourceDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/search" element={<Search />} />

          <Route path="/events" element={<Events />} />
          <Route path="/orgs" element={<Orgs />} />
          <Route path="/resources" element={<Resources />} />

          {/* details */}
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/orgs/:id" element={<OrgDetail />} />
          <Route path="/resources/:id" element={<ResourceDetail />} />

          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
