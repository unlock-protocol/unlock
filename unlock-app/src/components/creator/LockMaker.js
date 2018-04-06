import React from 'react'
import { connect } from 'react-redux'
import { Route } from 'react-router-dom'

import { Row, Col } from 'reactstrap'

import LockMakerForm from './LockMakerForm'
import Locks from './Locks'
import Lock from './Lock'

class LockMaker extends React.Component {
  constructor (props, context) {
    super(props)
    this.createLock = this.createLock.bind(this)
  }

  createLock (params) {
    this.props.unlock.methods['createLock'].cacheSend(...Object.values(params), {
      gas: 89499 * 10,
      from: this.props.currentAccount
    })
  }

  render () {
    return (
      <Row>
        <Col>
          <LockMakerForm createLock={this.createLock} store={this.props.store} />
        </Col>
        <Col>
          <Locks locks={this.props.locks} />
        </Col>
        <Col>
          <Route exact={true} path="/" render={() => {
            return (<p></p>)
          }} />
          <Route path="/creator/lock/:lockAddress" component={Lock} />
        </Col>
      </Row>
    )
  }
}

/*
 * Export connected component.
 * pass everything
 */

const mapStateToProps = state => {
  // Unlock contract
  const unlockAddress = Object.keys(state.contracts).find((address) => {
    return state.contracts[address].name === 'Unlock'
  })
  const unlock = state.contracts[unlockAddress]

  // Locks
  const locks = {}
  Object.keys(state.contracts).forEach((address) => {
    if (state.contracts[address].name === 'Lock') {
      locks[address] = state.contracts[address]
    }
  })

  return {
    unlock,
    locks: Object.values(locks),
    currentAccount: state.currentAccount
  }
}

export default connect(mapStateToProps)(LockMaker)
