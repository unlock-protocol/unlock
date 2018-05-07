import UnlockPropTypes from '../../propTypes'
import React from 'react'
import { connect } from 'react-redux'
import { ListGroupItem, ListGroup, Row, Col } from 'reactstrap'

const KeyReleaseMechanism = (props) => {
  if (props.mechanism === '0') {
    return (<span>Public</span>)
  }
  if (props.mechanism === '1') {
    return (<span>Permissioned</span>)
  }
  if (props.mechanism === '2') {
    return (<span>Private</span>)
  }
  return (<span>&nbsp;</span>)
}

KeyReleaseMechanism.propTypes = {
  mechanism: UnlockPropTypes.mechanism,
}

const Lock = (props) => {
  if (!props.lock) {
    return (<span>Loading...</span>)
  }
  return (
    <Row>
      <Col>
        <h1>Details</h1>
        <ListGroup>
          <ListGroupItem>
            <p>Key Release Mechanism: <KeyReleaseMechanism mechanism={ props.lock.keyReleaseMechanism() } /></p>
          </ListGroupItem>
          <ListGroupItem>
            <p>Key Duration (seconds): {props.lock.expirationDuration()}</p>
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
    lock: state.lock,
  }
}

export default connect(mapStateToProps)(Lock)
