import React from 'react'
import { Row, Col, Button } from 'reactstrap'

export default (props) => {
  const now = new Date().getTime() / 1000
  if (props.currentKey.expiration === 0) {
    return (<Col>
      <Row>
        <Col>
          You need a key to access this content! Purchase one for {props.lock.keyPrice()}.
        </Col>
        <Col>
          <Button color="primary" onClick={() => { props.purchaseKey(props.lock, props.account) }}>Purchase</Button>
        </Col>
      </Row>
    </Col>)
  } else if (props.currentKey.expiration < now) {
    return (<Col>
      <Row>
        <Col>
          Your key has expired! Purchase a new one for {props.lock.keyPrice()}.
        </Col>
        <Col>
          <Button color="primary" onClick={() => { props.purchaseKey(props.lock, props.account) }}>Purchase</Button>
        </Col>
      </Row>
    </Col>)
  } else {
    return (<p>Yes, your key expires at {props.currentKey.expiration}</p>)
  }
}
