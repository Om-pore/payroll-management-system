import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="text-center">
            <Card.Body>
              <h1>404</h1>
              <h3>Page Not Found</h3>
              <p className="text-muted">
                The page you are looking for doesn't exist or has been moved.
              </p>
              <Button variant="primary" onClick={() => navigate('/')}>
                Go Home
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;