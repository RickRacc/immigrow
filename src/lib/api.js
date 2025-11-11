// src/lib/api.js
const API_BASE = "/api";

// Generic fetch helper with nice errors
async function fetchJson(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} for ${path} — ${text.slice(0, 120)}`);
  }
  return res.json();
}

/* ---------- Organizations ---------- */
export async function fetchOrgs() {
  // backend route is /orgs/ (with trailing slash)
  return fetchJson("/orgs/");
}
export const fetchOrganizations = fetchOrgs; // alias

export async function fetchOrgById(id) {
  return fetchJson(`/orgs/${id}`);
}

/* ---------- Events (global) ---------- */
export async function fetchEvents() {
  return fetchJson("/events");
}

export async function fetchEventById(id) {
  return fetchJson(`/events/${id}`);
}

/* ---------- Events (by organization) ---------- */
/* If /orgs/:id/events exists, we use it. Otherwise we fall back to
   fetching all events and filtering by organization_id / organizationId. */
export async function fetchEventsByOrg(orgId) {
  try {
    return await fetchJson(`/orgs/${orgId}/events`);
  } catch (e) {
    // Fallback: filter client-side
    const all = await fetchEvents();
    const idStr = String(orgId);
    return all.filter(
      (ev) =>
        String(ev.organization_id ?? ev.organizationId ?? ev.org_id ?? "") ===
        idStr
    );
  }
}

/* ---------- Resources (global) ---------- */
export async function fetchResources() {
  return fetchJson("/resources");
}

export async function fetchResourceById(id) {
  return fetchJson(`/resources/${id}`);
}

/* ---------- Resources (by organization) ---------- */
/* Optional helper if you later add /orgs/:id/resources.
   It also falls back to client-side filtering. */
export async function fetchResourcesByOrg(orgId) {
  try {
    return await fetchJson(`/orgs/${orgId}/resources`);
  } catch {
    const all = await fetchResources();
    const idStr = String(orgId);
    return all.filter(
      (r) =>
        String(r.organization_id ?? r.organizationId ?? r.org_id ?? "") ===
        idStr
    );
  }
}

/* Optional default export (handy for quick importing) */
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
