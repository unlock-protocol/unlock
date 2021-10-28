import React from "react";
import {
  Container,
  Col
} from "react-bootstrap";
import Forms from './components/Forms'


const App = () => (
  <Container>
     <Col md={6}>
      <Forms/>
    </Col>
  </Container>
);

export default App;
