import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Button } from "react-bootstrap";
import { fetchOrgById } from "../lib/api";

export default function OrgDetail() {
  const { id } = useParams();
  const cleanId = String(id).replace(/^org-/, ""); // handle /orgs/org-2

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const org = await fetchOrgById(cleanId);
        if (!cancel) setData(org);
      } catch (e) {
        if (!cancel) setErr(e?.message || String(e));
      }
    })();
    return () => { cancel = true; };
  }, [cleanId]);

  if (err) {
    return (
      <Container className="py-4">
        <div className="alert alert-danger">Error: {err}</div>
        <Link to="/orgs">← Back to Organizations</Link>
      </Container>
    );
  }

  if (!data) {
    return <Container className="py-4">Loading organization…</Container>;
  }

  // helpers
  const cityState =
    data.city && data.state
      ? `${data.city}, ${data.state}`
      : data.city || data.state || "";

  const rawImg = data.image_url || data.logo_url || data.logo || "";
  const imageUrl = rawImg
    ? rawImg.startsWith("//")
      ? `https:${rawImg}`
      : rawImg
    : "/images/orgs/default.jpg";

  const withProto = (url) =>
    !url ? "" : url.startsWith("http") ? url : `https://${url}`;

  return (
    <Container className="py-4">
      <div className="mb-3">
        <Link to="/orgs">← Back to Organizations</Link>
      </div>

      <h1 className="mb-1">{data.name ?? `Organization ${cleanId}`}</h1>
      {cityState && <div className="text-muted mb-3">{cityState}</div>}

      <Row className="g-4">
        {/* Left: Image + quick facts */}
        <Col md={4}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Img
              src={imageUrl}
              alt={data.name ?? "Organization"}
              onError={(e) => (e.currentTarget.src = "/images/orgs/default.jpg")}
              style={{ height: 220, objectFit: "cover" }}
            />
            <Card.Body>
              {data.topic && (
                <Badge bg="primary" className="mb-2">
                  {data.topic}
                </Badge>
              )}
              <ul className="list-unstyled small m-0">
                {data.meeting_frequency && (
                  <li className="py-1">
                    <strong>Meeting:</strong> {data.meeting_frequency}
                  </li>
                )}
                {data.size && (
                  <li className="py-1">
                    <strong>Size:</strong> {data.size}
                  </li>
                )}
                {data.phone && (
                  <li className="py-1">
                    <strong>Phone:</strong>{" "}
                    <a href={`tel:${data.phone}`}>{data.phone}</a>
                  </li>
                )}
                {data.email && (
                  <li className="py-1">
                    <strong>Email:</strong>{" "}
                    <a href={`mailto:${data.email}`}>{data.email}</a>
                  </li>
                )}
                {data.address && (
                  <li className="py-1">
                    <strong>Address:</strong> {data.address}
                  </li>
                )}
              </ul>
            </Card.Body>

            {(data.website || data.external_url || data.guidestar_url) && (
              <Card.Footer className="bg-white d-flex gap-2 flex-wrap">
                {data.website && (
                  <Button
                    size="sm"
                    as="a"
                    href={withProto(data.website)}
                    target="_blank"
                    rel="noreferrer"
                    variant="outline-primary"
                  >
                    Website
                  </Button>
                )}
                {data.external_url && (
                  <Button
                    size="sm"
                    as="a"
                    href={withProto(data.external_url)}
                    target="_blank"
                    rel="noreferrer"
                    variant="outline-secondary"
                  >
                    External
                  </Button>
                )}
                {data.guidestar_url && (
                  <Button
                    size="sm"
                    as="a"
                    href={withProto(data.guidestar_url)}
                    target="_blank"
                    rel="noreferrer"
                    variant="outline-dark"
                  >
                    Guidestar
                  </Button>
                )}
              </Card.Footer>
            )}
          </Card>
        </Col>

        {/* Right: About + attributes */}
        <Col md={8}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body>
              <h5 className="mb-3">About</h5>
              <p className="mb-4">
                {data.description || "Details coming soon."}
              </p>

              <Row xs={1} md={2} className="g-3">
                {data.services && (
                  <Col>
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        <div className="small text-muted">Services</div>
                        <div>{data.services}</div>
                      </Card.Body>
                    </Card>
                  </Col>
                )}
                {data.languages && (
                  <Col>
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        <div className="small text-muted">Languages</div>
                        <div>{data.languages}</div>
                      </Card.Body>
                    </Card>
                  </Col>
                )}
                {data.hours && (
                  <Col>
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        <div className="small text-muted">Hours</div>
                        <div>{data.hours}</div>
                      </Card.Body>
                    </Card>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
