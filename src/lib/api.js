// src/lib/api.js

/** Base URL for your Flask API (behind Vite's proxy or absolute) */
const API_BASE = import.meta.env.VITE_API_BASE ?? "";

/** Small helper to GET JSON and throw nice errors */
async function fetchJSON(path) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    // surface server tracebacks as a short message
    const text = await res.text().catch(() => "");
    const snippet = text?.slice?.(0, 180) ?? "";
    throw new Error(`HTTP ${res.status} for ${path}${snippet ? ` — ${snippet}` : ""}`);
  }
  return res.json();
}

/* =========================================================
   ORGANIZATIONS
   ======================================================= */

function normalizeOrg(o) {
  // prefer an explicit image URL if present; otherwise fall back
  const raw =
    o.image_url ||
    o.logo_url ||
    o.logo ||
    "";

  const normalized =
    raw?.startsWith("//") ? `https:${raw}` :
    raw?.startsWith("http") ? raw :
    raw;

  return {
    id: o.id ?? o.org_id ?? String(o.id ?? ""),
    name: o.name ?? "Unnamed Organization",
    city: o.city ?? "",
    state: o.state ?? "",
    topic: o.topic ?? o.category ?? "",
    meeting: o.meeting_frequency ?? o.meeting ?? "",
    website: o.website ?? o.url ?? "",
    imageUrl: normalized || "/images/orgs/default.jpg",
    // pass through the original for details page
    _raw: o,
  };
}

export async function fetchOrgs() {
  const data = await fetchJSON("/api/orgs");
  return (Array.isArray(data) ? data : []).map(normalizeOrg);
}

export async function fetchOrgById(id) {
  // accept id or path-like '/org-2'
  const cleanId = String(id).replace(/^org-/, "").replace(/^\/+/, "");
  const item = await fetchJSON(`/api/orgs/${cleanId}`);
  return normalizeOrg(item);
}

/* =========================================================
   RESOURCES
   ======================================================= */

function normalizeResource(r) {
  const raw =
    r.image_url ||
    r.logo_url ||
    r.logo ||
    "";

  const normalized =
    raw?.startsWith("//") ? `https:${raw}` :
    raw?.startsWith("http") ? raw :
    raw;

  return {
    id: r.id ?? r.resource_id ?? String(r.id ?? ""),
    title: r.title ?? r.name ?? "Untitled Resource",
    summary: r.summary ?? r.description ?? "",
    topic: r.topic ?? r.category ?? "",
    website: r.website ?? r.url ?? "",
    imageUrl: normalized || "/images/resources/default.jpg",
    _raw: r,
  };
}

export async function fetchResources() {
  const data = await fetchJSON("/api/resources");
  return (Array.isArray(data) ? data : []).map(normalizeResource);
}

export async function fetchResourceById(id) {
  const cleanId = String(id).replace(/^res-/, "").replace(/^\/+/, "");
  const item = await fetchJSON(`/api/resources/${cleanId}`);
  return normalizeResource(item);
}

/* =========================================================
   EVENTS
   ======================================================= */

function normalizeEvent(e) {
  // ---- date/time ----
  const startISO = e.start ?? e.start_time ?? e.date ?? null;
  const endISO   = e.end ?? e.end_time ?? null;

  // ---- location pieces ----
  const city  = e.city ?? e.location_city ?? e.venue_city ?? null;
  const state = e.state ?? e.location_state ?? e.venue_state ?? null;

  // IMPORTANT: don’t mix ?? and || without grouping
  const cityState = [city, state].filter(Boolean).join(", "); // "" if neither
  const location  =
    e.location
    ?? e.venue
    ?? (cityState || e.place || null);

  // ---- links & description ----
  const url = e.url ?? e.link ?? e.event_url ?? null;

  const description =
    e.description
    ?? e.summary
    ?? e.details
    ?? "";

  // ---- image ----
  const rawImg =
    e.image_url ||
    e.logo_url  ||
    e.banner    ||
    e.image     ||
    "";

  const imageUrl =
    rawImg?.startsWith("//") ? `https:${rawImg}` :
    rawImg?.startsWith("http") ? rawImg :
    (rawImg || "/images/events/default.jpg");

  return {
    id: e.id ?? e.event_id ?? String(e.id ?? ""),
    title: e.title ?? e.name ?? "Untitled Event",
    startISO,
    endISO,
    location,
    url,
    description,
    imageUrl,
    _raw: e,
  };
}

export async function fetchEvents() {
  // backend exposes /events; frontend dev server typically proxies /api -> backend
  // If you’re proxying, set VITE_API_BASE="" and use "/api/events" instead.
  const path = API_BASE ? "/events" : "/api/events";
  const data = await fetchJSON(path);
  return (Array.isArray(data) ? data : []).map(normalizeEvent);
}

export async function fetchEventById(id) {
  const cleanId = String(id).replace(/^evt-/, "").replace(/^\/+/, "");
  const path = API_BASE ? `/events/${cleanId}` : `/api/events/${cleanId}`;
  const item = await fetchJSON(path);
  return normalizeEvent(item);
}
