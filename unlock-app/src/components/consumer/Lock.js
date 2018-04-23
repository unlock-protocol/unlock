import PropTypes from 'prop-types'
import UnlockPropTypes from '../../propTypes'

import React from 'react'
import { connect } from 'react-redux'
import { Row, Col, Button } from 'reactstrap'

import { purchaseKey } from '../../actions/key'

export const Lock = (props) => {
  if (!props.account || !props.lock || !props.currentKey) {
    return (<span>Loading...</span>)
  }
  const now = new Date().getTime() / 1000
  if (props.currentKey.expiration === 0) {
    return (<Row>
      <Col>
        You need a key to access this content! Purchase one that is valid {props.lock.expirationDuration()} seconds for {props.lock.keyPrice()}.
      </Col>
      <Col>
        <Button color="primary" onClick={() => { props.purchaseKey(props.lock, props.account) }}>Purchase</Button>
      </Col>
    </Row>)
  } else if (props.currentKey.expiration < now) {
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
        <p>Your key expires at {props.currentKey.expiration}</p>
      </Col>
    </Row>)
  }
}

Lock.propTypes = {
  account: PropTypes.string,
  lock: UnlockPropTypes.lock,
  currentKey: UnlockPropTypes.key,
  purchaseKey: PropTypes.func,
}

const mapDispatchToProps = dispatch => ({
  purchaseKey: (lock, account) => dispatch(purchaseKey(lock, account)),
})

const mapStateToProps = state => {
  return {
    currentKey: state.currentKey,
    account: state.currentAccount,
    lock: state.currentLock,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Lock)
