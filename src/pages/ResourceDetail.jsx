import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { fetchResourceById } from "../lib/api";

const withProto = (url) =>
  !url ? "" : url.startsWith("http") ? url : `https://${url}`;

export default function ResourceDetail() {
  const { id } = useParams();
  const cleanId = String(id).replace(/^res-/, ""); // allow /resources/res-123

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await fetchResourceById(cleanId); // GET /api/resources/:id
        if (!cancel) setData(r);
      } catch (e) {
        if (!cancel) setErr(e?.message || String(e));
      }
    })();
    return () => {
      cancel = true;
    };
  }, [cleanId]);

  if (err) {
    return (
      <Container className="py-4">
        <div className="alert alert-danger">Error: {err}</div>
        <Link to="/resources">← Back to Resources</Link>
      </Container>
    );
  }

  if (!data) return <Container className="py-4">Loading resource…</Container>;

  const title = data.name || data.title || `Resource ${cleanId}`;
  const rawImg = data.image_url || "";
  const imageUrl = rawImg
    ? rawImg.startsWith("//")
      ? `https:${rawImg}`
      : rawImg
    : "/images/resources/default.jpg"; // 👈 fallback

  return (
    <Container className="py-4">
      <div className="mb-3">
        <Link to="/resources">← Back to Resources</Link>
      </div>

      <h1 className="mb-1">{title}</h1>
      {data.topic && (
        <div className="text-muted mb-3">
          Topic:{" "}
          <Badge bg="warning" text="dark">
            {data.topic}
          </Badge>
        </div>
      )}

      <Row className="g-4">
        {/* Left: cover + CTA */}
        <Col md={4}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Img
              src={imageUrl}
              alt={title}
              onError={(e) =>
                (e.currentTarget.src = "/images/resources/default.jpg")
              }
              style={{ height: 220, objectFit: "cover" }}
            />
            {(data.external_url || data.url) && (
              <Card.Footer className="bg-white">
                <Button
                  size="sm"
                  as="a"
                  href={withProto(data.external_url || data.url)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Resource
                </Button>
              </Card.Footer>
            )}
          </Card>
        </Col>

        {/* Right: summary & meta */}
        <Col md={8}>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body>
              <h5 className="mb-3">Summary</h5>
              <p className="mb-4">
                {data.description || "Details coming soon."}
              </p>

              <Row xs={1} md={2} className="g-3">
                {data.author && (
                  <Col>
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        <div className="small text-muted">Author</div>
                        <div>{data.author}</div>
                      </Card.Body>
                    </Card>
                  </Col>
                )}
                {data.language && (
                  <Col>
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        <div className="small text-muted">Language</div>
                        <div>{data.language}</div>
                      </Card.Body>
                    </Card>
                  </Col>
                )}
                {data.format && (
                  <Col>
                    <Card className="border-0 bg-light">
                      <Card.Body>
                        <div className="small text-muted">Format</div>
                        <div>{data.format}</div>
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
