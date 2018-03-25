import React from 'react'
import PropTypes from 'prop-types'
import { drizzleConnect } from 'drizzle-react'
import { Input, FormGroup, Label } from 'reactstrap'
import { setAccount } from '../actions/setAccount'

class Account extends React.Component {
  constructor (props, context) {
    super(props)
  }

  render () {
    return (
      <FormGroup>
        <Label>Account</Label>
        <Input type="select" value={this.props.currentAccount} onChange={(event) => this.props.setAccount(event.target.value)}>
          {Object.keys(this.props.accounts).map((i) => {
            return (<option value={this.props.accounts[i]} key={i}>{this.props.accounts[i]}</option>)
          })}
        </Input>
      </FormGroup>
    )
  }
}

Account.contextTypes = {
  drizzle: PropTypes.object
}

const mapStateToProps = state => {
  return {
    currentAccount: state.currentAccount,
    accounts: state.accounts || {}
  }
}

const mapDispatchToProps = dispatch => ({
  setAccount: account => dispatch(setAccount(account))
})

export default drizzleConnect(Account, mapStateToProps, mapDispatchToProps)
