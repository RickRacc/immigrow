// src/components/EntityGrid.jsx
import { Link } from "react-router-dom";
import { Row, Col, Card, Badge } from "react-bootstrap";

export default function EntityGrid({
  items,
  linkFunc,                 // (item) => `/orgs/${item.id}` (or resources/events)
  titleKey = "name",
  subtitleFunc = () => "",
  footFunc = () => "",
  imageKey = "imageUrl",
  fallbackImage = "/images/orgs/default.jpg",
}) {
  const norm = (u) => (u?.startsWith("//") ? `https:${u}` : u);

  return (
    <Row xs={1} sm={2} lg={3} className="g-4">
      {items.map((it) => {
        const link = linkFunc?.(it) ?? "#";
        const title = it[titleKey];
        const imageUrl = norm(it[imageKey]) || fallbackImage;

        return (
          <Col key={it.id}>
            <Link to={link} className="text-decoration-none text-reset">
              <Card className="h-100 shadow-sm border-0 rounded-4 position-relative">
                <Card.Img
                  src={imageUrl}
                  alt={title}
                  onError={(e) => (e.currentTarget.src = fallbackImage)}
                  style={{ height: 200, objectFit: "cover" }}
                />
                <Card.Body>
                  <Card.Title className="h6 mb-1">{title}</Card.Title>
                  <div className="text-muted small mb-2">{subtitleFunc(it)}</div>
                  {footFunc(it) && <Badge bg="secondary">{footFunc(it)}</Badge>}
                </Card.Body>
                <span className="stretched-link" />
              </Card>
            </Link>
          </Col>
        );
      })}
    </Row>
  );
}
