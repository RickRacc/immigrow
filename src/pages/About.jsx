// src/pages/About.jsx
import React from 'react';
import { useGitLabStats } from '../hooks/useGitLabStats';

export default function About() {
  const { loading, error, project, totals, members, pipeline } = useGitLabStats();

  return (
    <>
      <h1>About</h1>

      <p>
        Immigrow is a community-driven platform built to support immigrants and
        their allies. We connect you to trustworthy organizations, upcoming
        events, and practical resources that can help with everything from legal
        guidance to cultural engagement.
      </p>

      {/* Project stats */}
      <section style={{ margin: '2rem 0' }}>
        <h2>Project Stats</h2>
        {loading && <p>Loading project stats…</p>}
        {error && <p style={{ color: 'crimson' }}>Error fetching stats: {error}</p>}
        {!loading && !error && (
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div style={card}>
              <h3 style={muted}>Repository</h3>
              <a href={project?.web_url} target="_blank" rel="noreferrer">{project?.path_with_namespace}</a>
            </div>
            <div style={card}>
              <h3 style={muted}>Total Commits</h3>
              <div style={big}>{totals.commits.toLocaleString()}</div>
            </div>
            <div style={card}>
              <h3 style={muted}>Total Issues</h3>
              <div style={big}>{totals.issues.toLocaleString()}</div>
            </div>
            <div style={card}>
              <h3 style={muted}>Latest Pipeline</h3>
              <div>
                {pipeline ? (
                  <>
                    <div><strong>Status:</strong> {pipeline.status}</div>
                    <div><strong>Ref:</strong> {pipeline.ref}</div>
                    <a href={pipeline.web_url} target="_blank" rel="noreferrer">View pipeline</a>
                  </>
                ) : (
                  <em>None</em>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Team */}
      <section style={{ margin: '2rem 0' }}>
        <h2>Team Members</h2>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {members.map((m) => (
            <article key={m.username} style={teamCard}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <img
                  src={m.photo}
                  alt={m.name}
                  style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', background: '#eee' }}
                  onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
                />
                <div>
                  <h3 style={{ margin: 0 }}>{m.name}</h3>
                  <div style={muted}>{m.role}</div>
                  <div style={muted}>@{m.username}</div>
                </div>
              </div>

              <p style={{ marginTop: '0.75rem' }}>{m.bio}</p>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={pill}><strong>{m.commits ?? 0}</strong> commits</div>
                <div style={pill}><strong>{m.issues ?? 0}</strong> issues</div>
                {/* “unit tests” count is repo/pipeline-specific; leave out or wire later */}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Data sources */}
      <section style={{ margin: '2rem 0' }}>
        <h2>Data Sources</h2>
        <p>
          During Phase I, we integrated at least one public REST API: <strong>Eventbrite API</strong> for event
          listings. Phase II will include detailed descriptions of scraping methods and additional sources.
        </p>
      </section>

      {/* Tools */}
      <section style={{ margin: '2rem 0' }}>
        <h2>Tools Used</h2>
        <ul>
          <li>
            <strong>GitLab</strong> — Version control, issues, CI/CD; stats on this page are fetched live via GitLab’s public API.
          </li>
          <li>
            <strong>Vite + React</strong> — Fast dev server and modern frontend tooling.
          </li>
          <li>
            <strong>AWS S3 + CloudFront</strong> — Static hosting & global CDN, deployed by GitLab CI.
          </li>
          <li>
            <strong>Postman</strong> — API exploration & documentation.
          </li>
        </ul>
      </section>

      {/* Links */}
      <section style={{ margin: '2rem 0' }}>
        <h2>Links</h2>
        <p>
          <a href={project?.web_url} target="_blank" rel="noreferrer">Immigrow GitLab Repository</a><br />
          <a href="#" target="_blank" rel="noreferrer">Immigrow Postman API Collection</a>
        </p>
      </section>
    </>
  );
}

/* little inline styles to keep it simple */
const card = {
  padding: '1rem',
  border: '1px solid #ececec',
  borderRadius: 12,
  background: '#fff',
};

const teamCard = {
  padding: '1rem',
  border: '1px solid #ececec',
  borderRadius: 12,
  background: '#fff',
  display: 'flex',
  flexDirection: 'column',
};

const muted = { color: '#666', fontSize: 14 };
const big = { fontSize: 28, fontWeight: 700 };
const pill = {
  fontSize: 13,
  padding: '0.3rem 0.6rem',
  border: '1px solid #eee',
  borderRadius: 999,
  background: '#fafafa',
};
