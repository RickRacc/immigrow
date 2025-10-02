// src/lib/gitlab.js
const BASE = import.meta.env.VITE_GITLAB_BASE || 'https://gitlab.com/api/v4';
const PROJECT_PATH = import.meta.env.VITE_GITLAB_PROJECT_PATH;

// Optional: private projects can add a read-only token
const PRIVATE_TOKEN = import.meta.env.VITE_GITLAB_TOKEN;

function headers() {
  const h = { 'Content-Type': 'application/json' };
  if (PRIVATE_TOKEN) h['PRIVATE-TOKEN'] = PRIVATE_TOKEN;
  return h;
}

async function gitlabGet(url) {
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return { json: await res.json(), res };
}

/** Resolve a project ID from a path (e.g. group/name). */
export async function getProject() {
  if (!PROJECT_PATH) throw new Error('Missing VITE_GITLAB_PROJECT_PATH');
  const encoded = encodeURIComponent(PROJECT_PATH);
  const { json } = await gitlabGet(`${BASE}/projects/${encoded}`);
  return json; // includes id, name, avatar_url, description, etc.
}

/** Get total commits for project (all authors) using X-Total header. */
export async function getCommitCount(projectId, q = '') {
  const url = new URL(`${BASE}/projects/${projectId}/repository/commits`);
  url.searchParams.set('per_page', '1');
  if (q) url.searchParams.set('author_username', q);
  const { res } = await gitlabGet(url.toString());
  const total = Number(res.headers.get('X-Total')) || 0;
  return total;
}

/** Get total issues for project (all or per author) using X-Total header. */
export async function getIssueCount(projectId, authorUsername = '') {
  const url = new URL(`${BASE}/projects/${projectId}/issues`);
  url.searchParams.set('per_page', '1');
  url.searchParams.set('state', 'all');
  if (authorUsername) url.searchParams.set('author_username', authorUsername);
  const { res } = await gitlabGet(url.toString());
  const total = Number(res.headers.get('X-Total')) || 0;
  return total;
}

/** Optionally: get latest pipeline; we’ll just expose something basic. */
export async function getLatestPipeline(projectId) {
  const url = new URL(`${BASE}/projects/${projectId}/pipelines`);
  url.searchParams.set('per_page', '1');
  const { json } = await gitlabGet(url.toString());
  return json?.[0] || null;
}
