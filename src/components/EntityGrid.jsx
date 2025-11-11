// src/components/EntityGrid.jsx
import { Row, Col, Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

/** Return a usable img URL or null (to skip rendering the <img>) */
function safeImage(url) {
  if (!url) return null;
  const u = String(url).trim();
  if (u.startsWith("//")) return "https:" + u;
  if (/^https?:\/\//i.test(u)) return u;
  return null; // anything else: don't try to render
}

export default function EntityGrid({
  items = [],
  linkFunc = (x) => "#",
  titleKey = "title",
  subtitleFunc = () => "",
  footFunc = () => "",
  imageKey = "imageUrl",
  badgeKey,            // optional badge (e.g., topic)
  headerText,          // optional H1 above grid
}) {
  return (
    <div className="container py-3">
      {headerText && <h1 className="mb-3">{headerText}</h1>}
      <Row xs={1} md={2} lg={3} className="g-3">
        {items.map((it) => {
          const imgUrl = safeImage(it[imageKey]);
          return (
            <Col key={it.id}>
              <Link to={linkFunc(it)} className="text-reset text-decoration-none">
                <Card className="h-100 shadow-sm border-0 rounded-4 position-relative">
                  {imgUrl && (
                    <Card.Img
                      variant="top"
                      src={imgUrl}
                      alt=""
                      style={{ objectFit: "cover", height: 220 }}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                  <Card.Body>
                    <Card.Title className="h5 mb-2">{it[titleKey]}</Card.Title>
                    {badgeKey && it[badgeKey] && (
                      <div className="mb-2">
                        <Badge bg="warning" text="dark">{it[badgeKey]}</Badge>
                      </div>
                    )}
                    <div className="small text-muted">{subtitleFunc(it)}</div>
                    {footFunc(it) && <div className="small mt-1">{footFunc(it)}</div>}
                  </Card.Body>
                  <span className="stretched-link" />
                </Card>
              </Link>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
