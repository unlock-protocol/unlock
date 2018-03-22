import React from 'react'
import PropTypes from 'prop-types'
import { drizzleConnect } from 'drizzle-react'
import { ListGroupItem, ListGroup, Row, Col } from 'reactstrap'

import LockContract from '../../artifacts/contracts/Lock.json'

class LockProperty extends React.Component {
  constructor (props, context) {
    super(props)
  }

  render () {
    this.dataKey = this.props.lock.methods[this.props.property].cacheCall()

    if (this.props.lock[this.props.property][this.dataKey]) {
      return (<p>{this.props.label}: {this.props.lock[this.props.property][this.dataKey].value}</p>)
    }
    return (<span>Loading</span>)
  }
}

class Lock extends React.Component {
  constructor (props, context) {
    super(props)
  }

  render () {
    return (
      <ListGroup>
        <ListGroupItem>
          <LockProperty lock={this.props.lock} property="keyPrice" label="Key Price" />
        </ListGroupItem>
        <ListGroupItem>
          <LockProperty lock={this.props.lock} property="maxNumberOfKeys" label="Max number of keys" />
        </ListGroupItem>
      </ListGroup>
    )
  }
}

class MaybeLock extends React.Component {
  constructor (props, context) {
    super(props)
    this.addContract = context.drizzle.addContract
  }

  render () {
    const lockAddress = this.props.match.params.lockAddress
    const lock = this.props.locks[lockAddress]

    if (!lock) {
      // SAME ANTIPATTERN. WE SHOULD NOT CHANGE DATA FROM RENDER!
      const NewLock = Object.assign({}, LockContract, {})
      this.addContract(NewLock, lockAddress, [])
      return (<span>Nope</span>)
    } else {
      return (
        <Row>
          <Col>
            <h1>Details</h1>
            <Lock lock={lock} />
          </Col>
        </Row>
      )
    }
  }
}

const mapStateToProps = state => {
  // Locks
  const locks = {}
  Object.keys(state.contracts).forEach((address) => {
    if (state.contracts[address].name === 'Lock') {
      locks[address] = state.contracts[address]
    }
  })

  return {
    locks
  }
}

MaybeLock.contextTypes = {
  drizzle: PropTypes.object
}

export default drizzleConnect(MaybeLock, mapStateToProps)
