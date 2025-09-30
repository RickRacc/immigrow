export default function About() {
  return (
    <>
      <h1>About</h1>

      <p>
        Description of the site, its purpose, its intended users <br />
        For each member: name, photo, bio, major responsibilities (eg.
        frontend/backend), no. of commits, no. of issues, no. of unit tests{" "}
        <br />
        Derive the stats dynamically, from GitLab (uses GitLab library) <br />
        Links to the data sources (just one public API source required this
        phase) <br />
        (description of how each was scraped will be required in phase II){" "}
        <br />
        <br />
        Tools used
        <br />
        describe their use
        <br />
        special focus on optional tools that were not required
        <br />
        a link to the GitLab repo
        <br />
        a link to the Postman API
        <br />
      </p>

      <p>
        Immigrow is a community-driven platform built to support immigrants and
        their allies. We connect you to trustworthy organizations, upcoming
        events, and practical resources that can help with everything from legal
        guidance to cultural engagement.
      </p>

      <p>
        <strong>Team Members</strong>
        <br />
        <em>Lucas Berio Perez</em> – DESCRIPTION HERE <br />
        <br />
        <em>Anisha Bhaskar Torres</em> – DESCRIPTION HERE <br />
        <br />
        <em>Mrinalini Jithendra</em> – DESCRIPTION HERE <br />
        <br />
        <em>Andrew Lee</em> – DESCRIPTION HERE <br />
        <br />
        <em>Rakesh Singh</em> – DESCRIPTION HERE <br />
        <br />
      </p>

      <p>
        <strong>Data Sources</strong>
        <br />
        During Phase I, we integrated at least one public REST API, 
        Eventbrite API (event listings) Current Phase II will include detailed 
        descriptions of scraping methods and additional sources. <br />
        <br />
      </p>

      <p>
        <strong>Tools Used</strong>
        <br />
        GitLab – Version control, issue tracking, CI/CD pipelines, and project
        stats (commit counts, issues, and test coverage dynamically displayed on
        this page). <br />
        MORE TOOLS... <br />
        <br />
      </p>

      <p>
        <strong>Links</strong>
        <br />
        <a href="#">Immigrow GitLab Repository</a>
        <br />
        <a href="#">Immigrow Postman API Collection</a>
        <br />
        <br />
      </p>
    </>
  );
}
