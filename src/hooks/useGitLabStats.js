// src/hooks/useGitLabStats.js
import { useEffect, useMemo, useState } from 'react';
import { getProject, getIssueCount, getLatestPipeline } from '../lib/gitlab';

const TEAM = [
  {
    name: 'Lucas Berio Perez',
    username: 'lucasberio815',
    role: 'Frontend & Deployment',
    bio: 'Builds UI, deploys to S3/CloudFront, and maintains CI/CD.',
    photo: '/images/team/lucas.jpg',
    emails: ['lucasberio815@gmail.com'],
  },
  {
    name: 'Anisha Bhaskar Torres',
    username: 'anisha1045',
    role: 'Backend & Data',
    bio: 'APIs, data pipelines, and Eventbrite integrations.',
    photo: '/images/team/anisha.jpg',
    emails: ['144181985+anisha1045@users.noreply.github.com'],
  },
  {
    name: 'Mrinalini Jithendra',
    username: 'mrinalinij05',
    role: 'Frontend',
    bio: 'UX & React components.',
    photo: '/images/team/mrinalini.jpg',
    emails: ['minijith@cs.utexas.edu'],
  },
  {
    name: 'Rakesh Singh',
    username: 'rrrakesh',
    role: 'Full-stack',
    bio: 'Rakesh Singh is a Junior CS student at UT Austin!',
    photo: '/images/team/rakesh.jpg',
    emails: ['rakesh.p.singh2030@gmail.com'],
  },
];

/* ──────────────────────────────────────────────────────────────────────────────
   GitLab fetch helpers
   ──────────────────────────────────────────────────────────────────────────── */
const GL_API = 'https://gitlab.com/api/v4';
const GL_TOKEN = import.meta.env.VITE_GITLAB_TOKEN;

function authHeaders() {
  return GL_TOKEN ? { Authorization: `Bearer ${GL_TOKEN}` } : {};
}

/**
 * Pages through commits and applies a LOCAL predicate to each commit.
 * This avoids relying on server-side author filters that may be ignored.
 *
 * Options:
 *  - ref (branch)            -> 'main' etc.; omit for repo-wide
 *  - predicate(commit)       -> returns true to count, false to skip
 *  - dedupeBySha (boolean)   -> if true, union by SHA to avoid double count
 */
async function pageAndCountCommits(projectId, { ref = null, predicate, dedupeBySha = false } = {}) {
  const perPage = 100;
  const safetyCap = 20_000; // guardrail
  let page = 1;
  let total = 0;
  const shaSet = dedupeBySha ? new Set() : null;

  // default predicate = count everything
  const pred = typeof predicate === 'function' ? predicate : () => true;

  while (true) {
    const params = new URLSearchParams({ per_page: String(perPage), page: String(page) });
    if (ref) params.set('ref_name', ref);

    const url = `${GL_API}/projects/${encodeURIComponent(projectId)}/repository/commits?${params.toString()}`;
    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText);
      throw new Error(`Commits fetch failed (${res.status}): ${msg}`);
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;

    for (const c of data) {
      if (!pred(c)) continue;
      if (shaSet) {
        const sha = c?.id || c?.short_id;
        if (sha && !shaSet.has(sha)) {
          shaSet.add(sha);
          total += 1;
        }
      } else {
        total += 1;
      }
    }

    if (data.length < perPage) break; // last page
    if (total >= safetyCap) break;

    page += 1;
  }

  return total;
}

/**
 * Count commits with robust local filtering:
 *  - If authorEmails provided -> union across those emails (case-insensitive)
 *  - Else if authorName provided -> match commit.author_name (case-insensitive)
 *  - Else -> unfiltered
 *
 * `ref`: pass a branch (e.g., 'main') to count on that branch; omit for repo-wide.
 */
async function fetchCommitTotal(
  projectId,
  { ref = null, authorEmails = [], authorName = null } = {}
) {
  if (Array.isArray(authorEmails) && authorEmails.length > 0) {
    const emailSet = new Set(
      authorEmails.map((e) => String(e || '').trim().toLowerCase()).filter(Boolean)
    );
    // Union by SHA to avoid counting same commit twice if multiple emails match
    return pageAndCountCommits(projectId, {
      ref,
      dedupeBySha: true,
      predicate: (c) => {
        const email = String(c?.author_email || '').toLowerCase();
        return emailSet.has(email);
      },
    });
  }

  if (authorName && String(authorName).trim()) {
    const nameLC = String(authorName).trim().toLowerCase();
    return pageAndCountCommits(projectId, {
      ref,
      predicate: (c) => String(c?.author_name || '').toLowerCase() === nameLC,
    });
  }

  // unfiltered
  return pageAndCountCommits(projectId, { ref });
}

export function useGitLabStats() {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [totals, setTotals] = useState({ commits: 0, issues: 0 });
  const [members, setMembers] = useState(TEAM);
  const [pipeline, setPipeline] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        // 1) Project (for default branch)
        const proj = await getProject();
        if (!mounted) return;
        setProject(proj);

        const ref = proj?.default_branch || 'main';

        // 2) Totals (repo-wide commits to match GitLab header)
        const [commitsAll, issuesAll, latest] = await Promise.all([
          fetchCommitTotal(proj.id, { /* repo-wide */ }),
          getIssueCount(proj.id),
          getLatestPipeline(proj.id).catch(() => null),
        ]);
        if (!mounted) return;
        setTotals({ commits: commitsAll, issues: issuesAll });
        setPipeline(latest ?? null);

        // 3) Per-member stats on default branch
        const enriched = await Promise.all(
          TEAM.map(async (m) => {
            const [myCommits, myIssues] = await Promise.all([
              fetchCommitTotal(proj.id, { ref, authorEmails: m.emails, authorName: m.name }),
              getIssueCount(proj.id, m.username),
            ]);
            return { ...m, commits: myCommits, issues: myIssues };
          })
        );
        if (!mounted) return;
        setMembers(enriched);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return useMemo(
    () => ({ loading, error, project, totals, members, pipeline }),
    [loading, error, project, totals, members, pipeline]
  );
}
