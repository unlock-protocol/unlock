import React from 'react'
import { Link } from 'react-router-dom'
import { ListGroupItem, ListGroup, Row, Col } from 'reactstrap'

const LockInList = (props) => {
  return (<ListGroupItem>
    <Link to={`/creator/lock/${props.lock.address}`}>
      {props.lock.address}
    </Link>
  </ListGroupItem>)
}

const Locks = (props) => {
  return (
    <Row>
      <Col>
        <h1>Locks</h1>
        <ListGroup>
          {props.locks.map((lock, idx) => {
            return (
              <LockInList lock={lock} key={idx} />
            )
          })}
        </ListGroup>
      </Col>
    </Row>
  )
}

export default Locks
