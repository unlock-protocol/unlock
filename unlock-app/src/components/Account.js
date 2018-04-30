import PropTypes from 'prop-types'
import UnlockPropTypes from '../propTypes'

import React from 'react'
import { connect } from 'react-redux'
import { Input, FormGroup, Label } from 'reactstrap'
import { setAccount } from '../actions/accounts'

const Account = (props) => {
  return (
    <FormGroup>
      <Label>Account</Label>
      <Input type="select" value={props.account} onChange={(event) => props.setAccount(event.target.value)}>
        {Object.keys(props.accounts).map((i) => {
          return (<option value={props.accounts[i]} key={i}>{props.accounts[i]}</option>)
        })}
      </Input>
    </FormGroup>
  )
}

Account.propTypes = {
  account: UnlockPropTypes.account,
  setAccount: PropTypes.func,
  accounts: PropTypes.arrayOf(UnlockPropTypes.account),
}

const mapStateToProps = state => {
  return {
    account: state.account || '',
    accounts: state.accounts || {},
  }
}

const mapDispatchToProps = dispatch => ({
  setAccount: account => dispatch(setAccount(account)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Account)
