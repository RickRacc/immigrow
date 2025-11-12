// src/pages/Resources.jsx
import { useEffect, useState } from "react";
import { Spinner, Alert } from "react-bootstrap";
import { fetchResources } from "../lib/api";
import EntityGrid from "../components/EntityGrid";
import Pagination, { PaginationInfo } from "../components/Pagination";

export default function Resources() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const response = await fetchResources(currentPage, 15);
        if (cancel) return;

        const data = response.data ?? [];
        const rows = data.map((r) => ({
          id: r.id,
          title: r.title ?? "Untitled",
          topic: r.topic ?? "Immigration Law",
          imageUrl: r.image_url || r.imageUrl || r.image || null,
          subtitle:
            [r.court_name, r.scope].filter(Boolean).join(" · ") || r.court_name || r.scope || "",
          foot: [
            r.citation,
            r.docket_number && `Docket: ${r.docket_number}`,
            r.date_published && `Filed: ${r.date_published}`,
          ]
            .filter(Boolean)
            .join(" · "),
        }));

        setItems(rows);
        setTotal(response.total ?? 0);
        setTotalPages(response.total_pages ?? 1);
      } catch (ex) {
        setErr(ex.message || String(ex));
      } finally {
        setLoading(false);
      }
    })();
    return () => void (cancel = true);
  }, [currentPage]);

  if (loading) return (<div className="container py-4"><Spinner animation="border" /></div>);
  if (err)      return (<div className="container py-4"><Alert variant="danger">Error: {err}</Alert></div>);

  return (
    <>
      <div className="container py-3">
        <h1 className="mb-3">Search from {total} Resources</h1>
        <PaginationInfo currentCount={items.length} itemType="resources" />
      </div>

      <EntityGrid
        items={items}
        linkFunc={(r) => `/resources/${r.id}`}
        titleKey="title"
        subtitleFunc={(r) => r.subtitle}
        footFunc={(r) => r.foot}
        imageKey="imageUrl"
        badgeKey="topic"
      />

      <div className="container">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}
