import { Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function EntityGrid({items, titleKey, subtitleFunc, linkFunc, footFunc}) {
    return (
        <Row xs={1} md={3} className="g-5">
          {items.map((item) => (
            <Col key={item.id}>
              <Card>
                <Card.Img 
                  variant="top" 
                  src={item.imageUrl} 
                  style={{ height: "200px", objectFit: "cover", width: "100%" }}/>

                <Card.Body>
                  <Card.Title>
                      <Link to={linkFunc(item)}>{item[titleKey]}</Link>
                  </Card.Title>
                  <Card.Text>{subtitleFunc(item)}</Card.Text>
                </Card.Body>

                <Card.Footer>{footFunc(item)}</Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
    )
}