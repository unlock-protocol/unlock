import React from 'react'
import PropTypes from 'prop-types'
import { drizzleConnect } from 'drizzle-react'
import { ListGroupItem, ListGroup, Row, Col } from 'reactstrap'
import { loadLock } from '../../actions/loadLock'

const LockProperty = (props) => {
  const dataKey = props.lock.methods[props.property].cacheCall()

  if (props.lock[props.property][dataKey]) {
    return (<p>{props.label}: {props.lock[props.property][dataKey].value}</p>)
  }
  return (<span>Loading</span>)
}

const Lock = (props) => {
  return (
    <ListGroup>
      <ListGroupItem>
        <LockProperty lock={props.lock} property="keyPrice" label="Key Price" />
      </ListGroupItem>
      <ListGroupItem>
        <LockProperty lock={props.lock} property="maxNumberOfKeys" label="Max number of keys" />
      </ListGroupItem>
      <ListGroupItem>
        <LockProperty lock={props.lock} property="owner" label="Owner" />
      </ListGroupItem>
      <ListGroupItem>
        <LockProperty lock={props.lock} property="outstandingKeys" label="Keys" />
      </ListGroupItem>
    </ListGroup>
  )
}

class MaybeLock extends React.Component {
  constructor (props, context) {
    super(props)
    this.addContract = context.drizzle.addContract
  }

  componentDidMount () {
    // Here we may be initialized with a missing lock (direct link?)
    const lockAddress = this.props.match.params.lockAddress

    if (!this.props.locks[lockAddress]) {
      this.props.loadLock(lockAddress)
    }
  }

  render () {
    const lock = this.props.locks[this.props.match.params.lockAddress]
    if (!lock) {
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

const mapDispatchToProps = dispatch => ({
  loadLock: lockAddress => dispatch(loadLock(lockAddress))
})

MaybeLock.contextTypes = {
  drizzle: PropTypes.object
}

export default drizzleConnect(MaybeLock, mapStateToProps, mapDispatchToProps)
