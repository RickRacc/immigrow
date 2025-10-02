// src/hooks/useGitLabStats.js
import { useEffect, useMemo, useState } from 'react';
import { getProject, getIssueCount, getLatestPipeline } from '../lib/gitlab';
import { UNSAFE_getTurboStreamSingleFetchDataStrategy } from 'react-router-dom';

const TEAM = [
  {
    name: 'Lucas Berio Perez',
    username: 'lucasberio815',
    role: 'Frontend & Deployment',
    bio: 'Builds UI, deploys to S3/CloudFront, and maintains CI/CD.',
    photo: '/images/team/lucas.jpg',
    emails: [
      'lucasberio815@gmail.com'
    ],
  },
  {
    name: 'Anisha Bhaskar Torres',
    username: 'anisha1045',
    role: 'Backend & Data',
    bio: 'APIs, data pipelines, and Eventbrite integrations.',
    photo: '/images/team/anisha.jpg',
    emails: [
      // 'anisha@example.edu',
    ],
  },
  {
    name: 'Mrinalini Jithendra',
    username: 'mrinalinij05',
    role: 'Frontend',
    bio: 'UX & React components.',
    photo: '/images/team/mrinalini.jpg',
    emails: [
      // 'mrinalini@example.edu',
    ],
  },
  {
    name: 'Rakesh Singh',
    username: 'rrrakesh',
    role: 'Full-stack',
    bio: 'Rakesh Singh is a Junior CS student at UT Austin!',
    photo: '/images/team/rakesh.jpg',
    emails: [
      'rakesh.p.singh2030@gmail.com'
    ],
  },
];

/* ──────────────────────────────────────────────────────────────────────────────
   Commit counting helpers (browser-friendly)
   We avoid relying on the X-Total header (not CORS-exposed). We page through
   commits and, if emails are provided, we filter client-side by author_email.
   ──────────────────────────────────────────────────────────────────────────── */
const GL_API = 'https://gitlab.com/api/v4';
const GL_TOKEN = import.meta.env.VITE_GITLAB_TOKEN;

/**
 * Count commits for a project by paging.
 * Options:
 *  - ref: branch/ref name (defaults to 'main' or project.default_branch)
 *  - authorUsername: optional; narrows results server-side
 *  - authorEmails: optional array of emails; filters client-side
 *
 * If authorEmails are supplied, we still page through all (or narrowed) commits
 * and count only those whose commit.author_email matches (case-insensitive).
 */
async function fetchCommitTotal(
  projectId,
  { ref = 'main', authorUsername, authorEmails = [] } = {}
) {
  const perPage = 100;
  let page = 1;
  let total = 0;
  const safetyCap = 20_000;

  // Normalize list for case-insensitive matching
  const emailSet =
    Array.isArray(authorEmails) && authorEmails.length
      ? new Set(authorEmails.map((e) => String(e).trim().toLowerCase()))
      : null;

  while (true) {
    const params = new URLSearchParams({
      per_page: String(perPage),
      page: String(page),
      ref_name: ref,
    });
    // Narrow by username if provided (reduces pages considerably)
    if (authorUsername) params.set('author_username', authorUsername);

    const res = await fetch(
      `${GL_API}/projects/${encodeURIComponent(
        projectId
      )}/repository/commits?${params.toString()}`,
      { headers: GL_TOKEN ? { Authorization: `Bearer ${GL_TOKEN}` } : {} }
    );

    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText);
      throw new Error(`Commits fetch failed (${res.status}): ${msg}`);
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;

    if (emailSet) {
      // Count only commits whose author_email matches one of ours
      for (const c of data) {
        const email = (c?.author_email || '').toLowerCase();
        if (emailSet.has(email)) total += 1;
      }
    } else {
      total += data.length;
    }

    if (data.length < perPage) break; // done
    if (total >= safetyCap) break; // guardrail

    page += 1;
  }

  return total;
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

        // 1) Project info (includes default branch)
        const proj = await getProject();
        if (!mounted) return;
        setProject(proj);

        const ref = proj?.default_branch || 'main';

        // 2) Totals for project
        const [commitsAll, issuesAll, latest] = await Promise.all([
          fetchCommitTotal(proj.id, { ref }),
          getIssueCount(proj.id),
          getLatestPipeline(proj.id).catch(() => null),
        ]);
        if (!mounted) return;
        setTotals({ commits: commitsAll, issues: issuesAll });
        setPipeline(latest ?? null);

        // 3) Per-member stats (commit counts use emails to be exact)
        const enriched = await Promise.all(
          TEAM.map(async (m) => {
            const [myCommits, myIssues] = await Promise.all([
              fetchCommitTotal(proj.id, {
                ref,
                authorUsername: m.username, // narrows server-side
                authorEmails: m.emails, // exact author_email matching
              }),
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
