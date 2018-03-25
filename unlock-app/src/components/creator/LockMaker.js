import React from 'react'
import PropTypes from 'prop-types'
import { drizzleConnect } from 'drizzle-react'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import { Row, Col } from 'reactstrap'

import LockMakerForm from './LockMakerForm'
import Locks from './Locks'
import Lock from './Lock'

class LockMaker extends React.Component {
  constructor (props, context) {
    super(props)

    this.drizzle = context.drizzle
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
      <Router>
        <Row>
          <Col>
            <LockMakerForm createLock={this.createLock} />
          </Col>
          <Col>
            <Locks locks={this.props.locks} />
          </Col>
          <Col>
            <Route exact={true} path="/" render={() => {
              return (<p></p>)
            }} />
            <Route path="/lock/:lockAddress" component={Lock} />
          </Col>
        </Row>
      </Router>
    )
  }
}

LockMaker.contextTypes = {
  drizzle: PropTypes.object
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

export default drizzleConnect(LockMaker, mapStateToProps)
