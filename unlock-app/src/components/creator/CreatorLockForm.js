import PropTypes from 'prop-types'
import uniqid from 'uniqid'
import React from 'react'
import styled from 'styled-components'
import Web3Utils from 'web3-utils'
import { connect } from 'react-redux'
import UnlockPropTypes from '../../propTypes'

import Icon from '../lock/Icon'
import { BalanceWithUnit } from '../helpers/Balance'
import { LockRow, LockName, LockDuration, LockKeys } from './CreatorLock'
import { LockStatus } from './lock/CreatorLockStatus'
import { createLock } from '../../actions/lock'

class CreatorLockForm extends React.Component {
  constructor (props, context) {
    super(props)
    this.state = {
      expirationDuration: 30,
      expirationDurationUnit: 86400, // Days
      keyPrice: '0.01',
      keyPriceCurrency: 'ether',
      maxNumberOfKeys: 10,
      name: 'New Lock',
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (event) {
    this.setState({ [event.target.name]: event.target.value })
  }

  handleSubmit () { // TODO save name to the redux store
    const lock = {
      name: this.state.name,
      expirationDuration: this.state.expirationDuration * this.state.expirationDurationUnit,
      keyPrice: Web3Utils.toWei(this.state.keyPrice.toString(10), this.state.keyPriceCurrency),
      maxNumberOfKeys: this.state.maxNumberOfKeys,
      owner: this.props.account.address, 
      id: uniqid(),
    }
    this.props.createLock(lock)
    if (this.props.hideAction) this.props.hideAction()
  }

  handleCancel(e) {
    e.stopPropagation() // This prevents submit from also being called
    if (this.props.hideAction) this.props.hideAction()
  }

  render() {
    return (
      <FormLockRow>
        <Icon />
        <FormLockName>
          <input type="text" name="name" onChange={this.handleChange} defaultValue={this.state.name} />
        </FormLockName>
        <FormLockDuration>
          <input type="text" name="expirationDuration" onChange={this.handleChange} defaultValue={this.state.expirationDuration} />
          {' '}
days
        </FormLockDuration>
        <FormLockKeys>
          <input type="text" name="maxNumberOfKeys" onChange={this.handleChange} defaultValue={this.state.maxNumberOfKeys} />
        </FormLockKeys>
        <FormBalanceWithUnit>
          三
          <input type="text" name="keyPrice" onChange={this.handleChange} defaultValue={this.state.keyPrice} />
        </FormBalanceWithUnit>
        <div>-</div>
        <LockStatus>
          <LockButton onClick={this.handleSubmit}>
            Submit
          </LockButton>
          <LockButton cancel onClick={this.handleCancel}>
            Cancel
          </LockButton>
        </LockStatus>
      </FormLockRow>
    )
  }
}

CreatorLockForm.propTypes = {
  lock: UnlockPropTypes.lock,
  account: UnlockPropTypes.account,
  hideAction: PropTypes.func,
  createLock: PropTypes.func,
}

const mapStateToProps = state => {
  return {
    account: state.network.account,
  }
}

const mapDispatchToProps = dispatch => ({
  createLock: lock => dispatch(createLock(lock)),
})

export default connect(mapStateToProps, mapDispatchToProps)(CreatorLockForm)

const FormLockRow = styled(LockRow)`
  grid-template-columns: 32px minmax(100px, 3fr) repeat(4, minmax(56px, 100px)) minmax(174px, 1fr);
  input[type=text] {
    background-color: var(--lightgrey);
    border: 0;
    padding: 5px;
    font-family: "IBM Plex Sans", sans-serif;
    font-size: 13px;
  }
`

const FormLockName = styled(LockName)`
  input[type=text] {
    width: 70px;
  }
`

const FormLockDuration = styled(LockDuration)`
  input[type=text] {
    width: 30px;
  }
`

const FormLockKeys = styled(LockKeys)`
  input[type=text] {
    width: 40px;
  }
`

const FormBalanceWithUnit = styled(BalanceWithUnit)`
  white-space: nowrap;
  input[type=text] {
    width: 30px;
  }
`

const LockButton = styled.button`
  font: inherit;
  font-size: ${props => props.cancel ? '10px' : '13px'};
  align-self: ${props => props.cancel ? 'center' : 'end'};
  background: none;
  color: inherit;
  border: none;
  outline: inherit;
  padding 0;
`
