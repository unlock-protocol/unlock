import PropTypes from 'prop-types'
import UnlockPropTypes from '../../propTypes'

import React from 'react'
import { connect } from 'react-redux'
import { Row, Col, Button } from 'reactstrap'

import { purchaseKey } from '../../actions/key'

export const Lock = (props) => {
  if (!props.account || !props.lock || !props.key) {
    return (<span>Loading...</span>)
  }
  const now = new Date().getTime() / 1000
  if (props.key.expiration === 0) {
    return (<Row>
      <Col>
        You need a key to access this content! Purchase one that is valid {props.lock.expirationDuration()} seconds for {props.lock.keyPrice()}.
      </Col>
      <Col>
        <Button color="primary" onClick={() => { props.purchaseKey(props.lock, props.account) }}>Purchase</Button>
      </Col>
    </Row>)
  } else if (props.key.expiration < now) {
    return (<Row>
      <Col>
          Your key has expired! Purchase a new one for {props.lock.keyPrice()}.
      </Col>
      <Col>
        <Button color="primary" onClick={() => { props.purchaseKey(props.lock, props.account) }}>Purchase</Button>
      </Col>
    </Row>)
  } else {
    return (<Row>
      <Col>
        <p>Your key expires at {props.key.expiration}</p>
      </Col>
    </Row>)
  }
}

Lock.propTypes = {
  account: PropTypes.string,
  lock: UnlockPropTypes.lock,
  key: UnlockPropTypes.key,
  purchaseKey: PropTypes.func,
}

const mapDispatchToProps = dispatch => ({
  purchaseKey: (lock, account) => dispatch(purchaseKey(lock, account)),
})

const mapStateToProps = state => {
  return {
    key: state.key,
    account: state.account,
    lock: state.lock,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Lock)
