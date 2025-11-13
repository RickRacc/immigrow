const ENV_BASE = import.meta.env.VITE_API_BASE?.trim();
const DEFAULT_BASE =
  // If you want to point straight to a remote API in dev, set VITE_API_BASE
  // Otherwise default to /api so Vite proxy (dev) & your CDN (prod) can route it.
  ENV_BASE ?? '/api';


console.log("DEFAULT_BASE (built-in):", DEFAULT_BASE);

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
export async function fetchOrgs(page = 1, perPage = 15) {
  return fetchJson(`/orgs?page=${page}&per_page=${perPage}`);
}
export async function fetchOrgById(id) {
  return fetchJson(`/orgs/${id}`);
}

/* --------- Events --------- */
export async function fetchEvents(page = 1, perPage = 15, options = {}) {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage)
  });

  // Add search parameter
  if (options.search) {
    params.append('search', options.search);
  }

  // Add sort parameters
  if (options.sort_by) {
    params.append('sort_by', options.sort_by);
  }
  if (options.sort_order) {
    params.append('sort_order', options.sort_order);
  }

  // Add filter parameters
  if (options.location) {
    params.append('location', options.location);
  }
  if (options.timezone) {
    params.append('timezone', options.timezone);
  }
  if (options.duration) {
    params.append('duration', options.duration);
  }

  return fetchJson(`/events?${params.toString()}`);
}

export async function fetchEventById(id) {
  return fetchJson(`/events/${id}`);
}

// client-side filter helper if you want events by org
export async function fetchEventsByOrg(orgId) {
  const all = await fetchEvents();
  return (all?.data ?? []).filter(e => String(e.organization_id ?? '') === String(orgId ?? ''));
}

/* --------- Resources --------- */
export async function fetchResources(page = 1, perPage = 15) {
  return fetchJson(`/resources?page=${page}&per_page=${perPage}`);
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
