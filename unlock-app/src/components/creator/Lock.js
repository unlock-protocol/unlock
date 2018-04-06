import React from 'react'
import { connect } from 'react-redux'
import { ListGroupItem, ListGroup, Row, Col } from 'reactstrap'

const LockProperty = (props) => {
  const dataKey = props.lock.methods[props.property].cacheCall()

  if (props.lock[props.property][dataKey]) {
    return (<p>{props.label}: {props.lock[props.property][dataKey].value}</p>)
  }
  return (<span>Loading</span>)
}

class Lock extends React.Component {
  constructor (props, context) {
    super(props)
  }

  render () {
    return (
      <Row>
        <Col>
          <h1>Details <span>Balance: </span></h1>
          <ListGroup>
            <ListGroupItem>
              <LockProperty lock={this.props.lock} property="keyReleaseMechanism" label="Key Release Mechanism" />
            </ListGroupItem>
            <ListGroupItem>
              <LockProperty lock={this.props.lock} property="keyPrice" label="Key Price" />
            </ListGroupItem>
            <ListGroupItem>
              <LockProperty lock={this.props.lock} property="maxNumberOfKeys" label="Max number of keys" />
            </ListGroupItem>
            <ListGroupItem>
              <LockProperty lock={this.props.lock} property="owner" label="Owner" />
            </ListGroupItem>
            <ListGroupItem>
              <LockProperty lock={this.props.lock} property="outstandingKeys" label="Outstanding keys" />
            </ListGroupItem>
          </ListGroup>
        </Col>
      </Row>)
  }
}

const mapStateToProps = state => {
  return {
    lock: state.contracts[state.currentLockAddress]
  }
}

export default connect(mapStateToProps)(Lock)
