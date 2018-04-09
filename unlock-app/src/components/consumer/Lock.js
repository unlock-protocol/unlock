import React from 'react'
import { connect } from 'react-redux'
import { Row, Col, Button } from 'reactstrap'

import { purchaseKey } from '../../actions/lock'

const HasKey = (props) => {
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

const mapDispatchToProps = dispatch => ({
  purchaseKey: (lock, account) => dispatch(purchaseKey(lock, account))
})

const mapStateToProps = state => {
  return {
    currentKey: state.currentKey,
    account: state.currentAccount,
    lock: state.currentLock
  }
}

const Lock = (props) => {
  if (!props.account || !props.lock || !props.currentKey) {
    return (<span>Loading...</span>)
  }
  return (<Row>
    <Col>
      <HasKey lock={props.lock} account={props.account} purchaseKey={props.purchaseKey} currentKey={props.currentKey} />
    </Col>
  </Row>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Lock)
