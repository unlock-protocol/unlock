import UnlockPropTypes from '../../propTypes'
import React from 'react'
import { connect } from 'react-redux'
import { ListGroupItem, ListGroup, Row, Col } from 'reactstrap'

const Lock = (props) => {
  if (!props.lock) {
    return (<span>Loading...</span>)
  }
  return (
    <Row>
      <Col>
        <h1>Details <span>Balance: </span></h1>
        <ListGroup>
          <ListGroupItem>
            <p>Key Release Mechanism: {props.lock.keyReleaseMechanism()}</p>
          </ListGroupItem>
          <ListGroupItem>
            <p>Key Price: {props.lock.keyPrice()}</p>
          </ListGroupItem>
          <ListGroupItem>
            <p>Max number of keys: {props.lock.maxNumberOfKeys()}</p>
          </ListGroupItem>
          <ListGroupItem>
            <p>Owner: {props.lock.owner()}</p>
          </ListGroupItem>
          <ListGroupItem>
            <p>Balance: {props.lock.balance()}</p>
          </ListGroupItem>
          <ListGroupItem>
            <p>Outstanding keys: {props.lock.outstandingKeys()}</p>
          </ListGroupItem>
        </ListGroup>
      </Col>
    </Row>)
}

Lock.propTypes = {
  lock: UnlockPropTypes.lock,
}

const mapStateToProps = state => {
  return {
    lock: state.currentLock,
  }
}

export default connect(mapStateToProps)(Lock)
