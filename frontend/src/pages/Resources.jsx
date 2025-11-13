// src/pages/Resources.jsx
import { useEffect, useState } from "react";
import { Row, Col, Card, Spinner, Alert, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { fetchResources } from "../lib/api";
import Pagination, { PaginationInfo } from "../components/Pagination";
import SearchAndFilters from "../components/SearchAndFilters";
import HighlightedText from "../components/HighlightedText";

export default function Resources() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Search and filter state
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    sortBy: "",
    sortOrder: "asc",
    filters: {}
  });

  const loadResources = async () => {
    setLoading(true);
    try {
      const options = {
        search: appliedFilters.search,
        sort_by: appliedFilters.sortBy,
        sort_order: appliedFilters.sortOrder,
        ...appliedFilters.filters
      };

      const response = await fetchResources(currentPage, 15, options);
      const data = response.data ?? [];
      const rows = data.map((r) => ({
        id: r.id,
        title: r.title ?? "Untitled",
        topic: r.topic ?? "Immigration Law",
        scope: r.scope ?? "",
        courtName: r.court_name ?? "",
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
  };

  useEffect(() => {
    let cancel = false;
    if (!cancel) {
      loadResources();
    }
    return () => { cancel = true; };
  }, [currentPage, appliedFilters]);

  const handleApplyFilters = (values) => {
    setAppliedFilters(values);
    setCurrentPage(1);
  };

  if (loading) return (<div className="container py-4"><Spinner animation="border" /></div>);
  if (err) return (<div className="container py-4"><Alert variant="danger">Error: {err}</Alert></div>);

  // Configuration for SearchAndFilters component
  const sortOptionsConfig = [
    { value: "date_published", label: "Date Published" },
    { value: "title", label: "Title" }
  ];

  const filterFieldsConfig = [
    {
      name: "topic",
      label: "Topic",
      type: "checkbox",
      options: [
        { value: "Immigration Law", label: "Immigration Law" },
        { value: "Citizenship", label: "Citizenship" },
        { value: "Asylum", label: "Asylum" },
        { value: "Deportation", label: "Deportation" }
      ]
    },
    {
      name: "scope",
      label: "Scope",
      type: "checkbox",
      options: [
        { value: "Federal", label: "Federal" },
        { value: "State", label: "State" },
        { value: "Local", label: "Local" }
      ]
    },
    {
      name: "court_name",
      label: "Court",
      type: "checkbox",
      options: [
        { value: "Supreme Court", label: "Supreme Court" },
        { value: "Court of Appeals", label: "Court of Appeals" },
        { value: "District Court", label: "District Court" }
      ]
    }
  ];

  return (
    <div className="container py-3">
      <h1 className="mb-3">Search from {total} Resources</h1>

      <SearchAndFilters
        onApply={handleApplyFilters}
        sortOptions={sortOptionsConfig}
        filterFields={filterFieldsConfig}
        searchPlaceholder="Search resources by title, topic, court, description..."
        initialValues={appliedFilters}
      />

      <PaginationInfo currentCount={items.length} itemType="resources" />

      <Row xs={1} md={2} lg={3} className="g-3">
        {items.map((r) => (
          <Col key={r.id}>
            <Link to={`/resources/${r.id}`} className="text-reset text-decoration-none">
              <Card className="h-100 shadow-sm border-0 rounded-4 position-relative" style={{ minHeight: "280px" }}>
                {r.imageUrl && (
                  <Card.Img
                    variant="top"
                    src={r.imageUrl}
                    alt=""
                    style={{ objectFit: "cover", height: 160 }}
                    loading="lazy"
                  />
                )}
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="h5 mb-2">
                    <HighlightedText text={r.title} searchQuery={appliedFilters.search} />
                  </Card.Title>

                  {r.topic && (
                    <div className="mb-2">
                      <Badge bg="warning" text="dark">
                        <HighlightedText text={r.topic} searchQuery={appliedFilters.search} />
                      </Badge>
                    </div>
                  )}

                  {r.subtitle && (
                    <div className="small text-muted mb-2">
                      <HighlightedText text={r.subtitle} searchQuery={appliedFilters.search} />
                    </div>
                  )}

                  {r.foot && (
                    <div className="small text-muted mt-auto" style={{ lineHeight: "1.4" }}>
                      <HighlightedText text={r.foot} searchQuery={appliedFilters.search} />
                    </div>
                  )}
                </Card.Body>
                <span className="stretched-link" />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
