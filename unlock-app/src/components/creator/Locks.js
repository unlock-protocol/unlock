import UnlockPropTypes from '../../propTypes'
import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { ListGroupItem, ListGroup, Row, Col } from 'reactstrap'

const LockInList = (props) => {
  return (<ListGroupItem>
    <Link to={`/creator/lock/${props.lock.address}`}>
      {props.lock.address}
    </Link>
  </ListGroupItem>)
}

LockInList.propTypes = {
  lock: UnlockPropTypes.lock,
}

const Locks = (props) => {
  return (
    <Row>
      <Col>
        <h1>Locks</h1>
        <ListGroup>
          {[...props.locks].map((lock, idx) => {
            return (
              <LockInList lock={lock} key={idx} />
            )
          })}
        </ListGroup>
      </Col>
    </Row>
  )
}

Locks.propTypes = {
  locks: UnlockPropTypes.locks,
}

const mapStateToProps = state => {
  const locks = state.locks
  return {
    locks,
  }
}

export default connect(mapStateToProps)(Locks)
