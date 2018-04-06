import React from 'react'
import { connect } from 'react-redux'
import { Row, Col, Button } from 'reactstrap'

const LockProperty = (props) => {
  const dataKey = props.lock.methods[props.property].cacheCall()

  if (props.lock[props.property][dataKey]) {
    return (<span>{props.lock[props.property][dataKey].value}</span>)
  }
  return (<span>Loading</span>)
}

class HasKey extends React.Component {
  render () {
    const dataKey = this.props.lock.methods.keyExpirationTimestampFor.cacheCall(this.props.account)

    const now = new Date().getTime() / 1000

    if (this.props.lock.keyExpirationTimestampFor[dataKey] && this.props.lock.keyExpirationTimestampFor[dataKey].value > 0) {
      if (this.props.lock.keyExpirationTimestampFor[dataKey].value > now) {
        return (<p>Yes, your key expires at {this.props.lock.keyExpirationTimestampFor[dataKey].value}</p>)
      } else {
        return (<p>You had a key... but it is now expired!</p>)
      }
    } else {
      return (<Col>
        <Row>
          <Col>
        You need a key to access this content! Purchase one for <LockProperty lock={this.props.lock} property="keyPrice" label="&nbsp;" />.
          </Col>
          <Col>
            <Button color="primary" onClick={this.props.purchase}>Purchase</Button>
          </Col>
        </Row>
      </Col>)
    }
  }
}

const mapStateToProps = state => {
  return {
    account: state.currentAccount,
    lock: state.contracts[state.currentLockAddress]
  }
}

class Lock extends React.Component {
  constructor (props, context) {
    super(props)
    this.purchase = this.purchase.bind(this)
  }

  purchase () {
    const dataKey = this.props.lock.methods.keyPrice.cacheCall()

    // RACE CONDITION IF THE USER HAS CLICKED THE PURCHASE BUTTON BEFORE DATA WAS LAODED
    if (this.props.lock.keyPrice[dataKey]) {
      this.props.lock.methods['purchase'].cacheSend('' /* data unset for now */, {
        value: this.props.lock.keyPrice[dataKey].value, // price of key!
        gas: 89499 * 10, // WE NEED TO USE THE RIGHT GAS?
        from: this.props.account
      })
    }
    return (<span>Loading...</span>)
  }

  render () {
    return (<Row>
      <Col>
        <HasKey lock={this.props.lock} account={this.props.account} purchase={this.purchase} />
      </Col>
    </Row>
    )
  }
}

export default connect(mapStateToProps)(Lock)
