// src/pages/Orgs.jsx
import { useEffect, useState } from "react";
import { Row, Col, Card, Spinner, Alert, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import { fetchOrgs } from "../lib/api";
import Pagination, { PaginationInfo } from "../components/Pagination";
import SearchAndFilters from "../components/SearchAndFilters";
import HighlightedText from "../components/HighlightedText";
import MatchIndicator from "../components/MatchIndicator";

export default function Orgs() {
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

  const loadOrgs = async () => {
    setLoading(true);
    try {
      const options = {
        search: appliedFilters.search,
        sort_by: appliedFilters.sortBy,
        sort_order: appliedFilters.sortOrder,
        ...appliedFilters.filters
      };

      const response = await fetchOrgs(currentPage, 15, options);
      const data = response.data ?? [];
      const rows = data.map(o => ({
        id: o.id,
        name: o.name ?? "Unnamed organization",
        city: o.city ?? "",
        state: o.state ?? "",
        topic: o.topic ?? "",
        size: o.size ?? "",
        description: o.description ?? "",
        meetingFrequency: o.meeting_frequency ?? "",
        ein: o.ein ?? "",
        imageUrl: (typeof o.image_url === 'string' && /^https?:\/\//i.test(o.image_url)) ? o.image_url : null,
        // Include all searchable fields for MatchIndicator
        address: o.address ?? "",
        zipcode: o.zipcode ?? "",
        subsection_code: o.subsection_code ?? "",
        ntee_code: o.ntee_code ?? "",
        external_url: o.external_url ?? "",
        guidestar_url: o.guidestar_url ?? ""
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
      loadOrgs();
    }
    return () => { cancel = true; };
  }, [currentPage, appliedFilters]);

  const handleApplyFilters = (values) => {
    setAppliedFilters(values);
    setCurrentPage(1);
  };

  if (loading) return (
    <div className="container py-4">
      <Spinner animation="border" />
    </div>
  );

  if (err) return (
    <div className="container py-4">
      <Alert variant="danger">
        Error loading organizations: {err}
      </Alert>
    </div>
  );

  // Configuration for SearchAndFilters component
  const sortOptionsConfig = [
    { value: "name", label: "Name" },
    { value: "city", label: "City" }
  ];

  // Fields to check for match indicator
  const orgMatchFields = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'topic', label: 'Topic' },
    { key: 'address', label: 'Address' },
    { key: 'zipcode', label: 'Zipcode' },
    { key: 'ein', label: 'EIN' },
    { key: 'size', label: 'Size' },
    { key: 'meetingFrequency', label: 'Meeting Frequency' },
    { key: 'subsection_code', label: 'Subsection Code' },
    { key: 'ntee_code', label: 'NTEE Code' },
    { key: 'external_url', label: 'URL' },
    { key: 'guidestar_url', label: 'Guidestar URL' }
  ];

  const filterFieldsConfig = [
    {
      name: "state",
      label: "State",
      type: "checkbox",
      options: [
        { value: "MI", label: "Michigan" },
        { value: "PA", label: "Pennsylvania" },
        { value: "CA", label: "California" },
        { value: "MA", label: "Massachusetts" },
        { value: "TX", label: "Texas" },
        { value: "CT", label: "Connecticut" },
        { value: "SC", label: "South Carolina" },
        { value: "IA", label: "Iowa" },
        { value: "FL", label: "Florida" },
        { value: "VA", label: "Virginia" },
        { value: "TN", label: "Tennessee" },
        { value: "HI", label: "Hawaii" }
      ]
    },
    {
      name: "topic",
      label: "Topic",
      type: "checkbox",
      options: [
        { value: "Legal Services", label: "Legal Services" },
        { value: "Human Services", label: "Human Services" },
        { value: "Community", label: "Community Services" },
        { value: "Civil Rights", label: "Civil Rights" }
      ]
    },
    {
      name: "size",
      label: "Size",
      type: "checkbox",
      options: [
        { value: "501(c)(3)", label: "501(c)(3) Nonprofit" }
      ]
    }
  ];

  return (
    <div className="container py-3">
      <h1 className="mb-3">Search from {total} Organizations</h1>

      <SearchAndFilters
        onApply={handleApplyFilters}
        sortOptions={sortOptionsConfig}
        filterFields={filterFieldsConfig}
        searchPlaceholder="Search organizations by name, topic, city, description..."
        initialValues={appliedFilters}
      />

      <PaginationInfo currentCount={items.length} itemType="organizations" />

      <Row xs={1} md={2} lg={3} className="g-3">
        {items.map((o) => (
          <Col key={o.id}>
            <Link to={`/orgs/${o.id}`} className="text-reset text-decoration-none">
              <Card className="h-100 shadow-sm border-0 rounded-4 position-relative" style={{ minHeight: "280px" }}>
                {o.imageUrl && (
                  <Card.Img
                    variant="top"
                    src={o.imageUrl}
                    alt=""
                    style={{ objectFit: "cover", height: 160 }}
                    loading="lazy"
                  />
                )}
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="h5 mb-2">
                    <HighlightedText text={o.name} searchQuery={appliedFilters.search} />
                  </Card.Title>

                  <div className="small text-muted mb-2">
                    <i className="bi bi-geo-alt-fill me-1"></i>
                    <HighlightedText
                      text={[o.city, o.state].filter(Boolean).join(", ")}
                      searchQuery={appliedFilters.search}
                    />
                  </div>

                  <div className="d-flex flex-wrap gap-1 mb-2">
                    {o.topic && (
                      <Badge bg="primary" className="text-white">
                        <HighlightedText text={o.topic} searchQuery={appliedFilters.search} />
                      </Badge>
                    )}
                    {o.size && <Badge bg="secondary">{o.size}</Badge>}
                  </div>

                  {o.meetingFrequency && (
                    <div className="small text-muted mb-2">
                      <i className="bi bi-calendar-event me-1"></i>
                      Meets {o.meetingFrequency}
                    </div>
                  )}

                  {o.description && (
                    <p className="small text-muted mb-0 mt-auto" style={{ lineHeight: "1.4" }}>
                      <HighlightedText
                        text={o.description.slice(0, 100) + (o.description.length > 100 ? "..." : "")}
                        searchQuery={appliedFilters.search}
                      />
                    </p>
                  )}

                  {o.ein && (
                    <div className="small text-muted mt-2">
                      <span className="badge bg-light text-dark">EIN: {o.ein}</span>
                    </div>
                  )}

                  <MatchIndicator
                    item={o}
                    searchQuery={appliedFilters.search}
                    fieldsToCheck={orgMatchFields}
                  />
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
