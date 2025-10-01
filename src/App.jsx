import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";
import Orgs from "./pages/Orgs";
import Resources from "./pages/Resources";
import CitizenshipWorkshop from "./pages/CitizenshipWorkshop";
import KnowYourRightsClinic from "./pages/KnowYourRightsClinic";
import ESLCommunityMeetup from "./pages/ESLCommunityMeetup";
import ImmigrantCommunityServices from "./pages/ImmigrantCommunityServicesClean";
import AustinAlliesImmigrantCare from "./pages/AustinAlliesClean";
import ESLCommunityClub from "./pages/ESLCommunityClubClean";
import N400NaturalizationChecklist from "./pages/N400NaturalizationChecklistClean";
import KnowYourRightsTexas from "./pages/KnowYourRightsTexasClean";
import BeginnerESLGuide from "./pages/BeginnerESLGuideClean";


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
            <Route path="/events/evt-1" element={<CitizenshipWorkshop />} />
            <Route path="/events/evt-2" element={<KnowYourRightsClinic />} />
            <Route path="/events/evt-3" element={<ESLCommunityMeetup />} />
            <Route path="/orgs" element={<Orgs />} />
            <Route path="/orgs/org-1" element={<ImmigrantCommunityServices />} />
            <Route path="/orgs/org-2" element={<AustinAlliesImmigrantCare />} />
            <Route path="/orgs/org-3" element={<ESLCommunityClub />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/res-1" element={<N400NaturalizationChecklist />} />
            <Route path="/resources/res-2" element={<KnowYourRightsTexas />} />
            <Route path="/resources/res-3" element={<BeginnerESLGuide />} />
          </Routes>
        </div>
      </BrowserRouter>


    </>

  );
}
