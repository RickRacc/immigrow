// src/lib/api.js
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

async function getJSON(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} for ${path}${txt ? ` — ${txt}` : ""}`);
  }
  return res.json();
}

// Resources
export function fetchResources() {
  return getJSON("/resources");
}
export function fetchResourceById(id) {
  const clean = String(id).replace(/^res-/, "");
  return getJSON(`/resources/${clean}`);
}

// Orgs
export function fetchOrganizations() {
  return getJSON("/orgs");
}
export function fetchOrgById(id) {
  const clean = String(id).replace(/^org-/, "");
  return getJSON(`/orgs/${clean}`);
}

// Events
export function fetchEvents() {
  return getJSON("/events");
}
export function fetchEventById(id) {
  const clean = String(id).replace(/^evt-/, "");
  return getJSON(`/events/${clean}`);
}

export { API_BASE };
