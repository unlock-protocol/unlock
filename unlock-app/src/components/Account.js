import React from 'react'
import { connect } from 'react-redux'
import { Input, FormGroup, Label } from 'reactstrap'
import { setAccount } from '../actions/accounts'

const Account = (props) => {
  return (
    <FormGroup>
      <Label>Account</Label>
      <Input type="select" value={props.currentAccount} onChange={(event) => props.setAccount(event.target.value)}>
        {Object.keys(props.accounts).map((i) => {
          return (<option value={props.accounts[i]} key={i}>{props.accounts[i]}</option>)
        })}
      </Input>
    </FormGroup>
  )
}

const mapStateToProps = state => {
  return {
    currentAccount: state.currentAccount || '',
    accounts: state.accounts || {}
  }
}

const mapDispatchToProps = dispatch => ({
  setAccount: account => dispatch(setAccount(account))
})

export default connect(mapStateToProps, mapDispatchToProps)(Account)
