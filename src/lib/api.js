// src/lib/api.js
const API_BASE = "/api";

// Generic fetch helper with readable errors
async function fetchJson(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} for ${path} — ${text.slice(0, 180)}`);
  }
  return res.json();
}

/* ---------- Organizations ---------- */
export async function fetchOrgs() {
  // backend route has trailing slash
  return fetchJson("/orgs/");
}
export const fetchOrganizations = fetchOrgs; // alias

export async function fetchOrgById(id) {
  return fetchJson(`/orgs/${id}`);
}

/* ---------- Events ---------- */
export async function fetchEvents() {
  return fetchJson("/events");
}

export async function fetchEventById(id) {
  return fetchJson(`/events/${id}`);
}

// filter helper: events that belong to an org
export async function fetchEventsByOrg(orgId) {
  const all = await fetchEvents();
  const sid = String(orgId ?? "");
  return (all ?? []).filter(e => String(e.organization_id ?? "") === sid);
}

/* ---------- Resources ---------- */
export async function fetchResources() {
  return fetchJson("/resources");
}

export async function fetchResourceById(id) {
  return fetchJson(`/resources/${id}`);
}

// Some datasets may not have an organization_id on resources.
// We still export this to satisfy imports; it will filter if the field exists,
// otherwise it returns an empty array (or you can choose to return all).
export async function fetchResourcesByOrg(orgId) {
  const all = await fetchResources();
  const sid = String(orgId ?? "");
  const filtered = (all ?? []).filter(r => String(r.organization_id ?? "") === sid);
  // If your resources truly have no organization_id, you can return [] or `all`.
  return filtered; // change to `return [];` if you prefer nothing.
}

/* ---------- default export (optional) ---------- */
export default {
  fetchOrgs,
  fetchOrganizations: fetchOrgs,
  fetchOrgById,
  fetchEvents,
  fetchEventById,
  fetchEventsByOrg,
  fetchResources,
  fetchResourceById,
  fetchResourcesByOrg,
};
