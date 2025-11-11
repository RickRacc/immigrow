const ENV_BASE = import.meta.env.VITE_API_BASE?.trim();
const DEFAULT_BASE =
  // If you want to point straight to a remote API in dev, set VITE_API_BASE
  // Otherwise default to /api so Vite proxy (dev) & your CDN (prod) can route it.
  ENV_BASE ?? '/api';

function joinUrl(base, path) {
  const b = base.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

async function fetchJson(path) {
  const url = joinUrl(DEFAULT_BASE, path);
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} for ${path} — ${text.slice(0, 160)}`);
  }
  return res.json();
}

/* --------- Organizations --------- */
export async function fetchOrgs() {
  return fetchJson('/orgs');
}
export async function fetchOrgById(id) {
  return fetchJson(`/orgs/${id}`);
}

/* --------- Events --------- */
export async function fetchEvents() {
  return fetchJson('/events');
}
export async function fetchEventById(id) {
  return fetchJson(`/events/${id}`);
}
// client-side filter helper if you want events by org
export async function fetchEventsByOrg(orgId) {
  const all = await fetchEvents();
  return (all ?? []).filter(e => String(e.organization_id ?? '') === String(orgId ?? ''));
}

/* --------- Resources --------- */
export async function fetchResources() {
  return fetchJson('/resources');
}
export async function fetchResourceById(id) {
  return fetchJson(`/resources/${id}`);
}

export default {
  fetchOrgs,
  fetchOrgById,
  fetchEvents,
  fetchEventById,
  fetchEventsByOrg,
  fetchResources,
  fetchResourceById,
};
