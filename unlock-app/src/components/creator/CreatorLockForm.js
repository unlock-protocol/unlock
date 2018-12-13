import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import Web3Utils from 'web3-utils'
import { connect } from 'react-redux'
import uniqid from 'uniqid'
import UnlockPropTypes from '../../propTypes'

import Icon from '../lock/Icon'
import { BalanceWithUnit, Eth } from '../helpers/Balance'
import {
  LockRow,
  LockName,
  LockDuration,
  LockKeys,
  LockRowGrid,
} from './CreatorLock'
import { LockStatus } from './lock/CreatorLockStatus'
import { createLock } from '../../actions/lock'

class CreatorLockForm extends React.Component {
  constructor(props, context) {
    super(props, context)
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

  validate(name, value) {
    return (
      (name === 'name' && typeof value === 'string' && value.length > 0) ||
      ((name === 'expirationDuration' || name === 'maxNumberOfKeys') &
        !isNaN(value) &&
        value > 0) ||
      (name === 'keyPrice' && !isNaN(value) && value >= 0)
    )
  }

  handleChange(event) {
    event.target.dataset.valid = this.validate(
      event.target.name,
      event.target.value
    )
    this.setState({ [event.target.name]: event.target.value })
  }

  handleSubmit() {
    if (document.querySelector('[data-valid="false"]')) return false

    const { account, createLock, hideAction } = this.props
    const {
      expirationDuration,
      expirationDurationUnit,
      keyPriceCurrency,
      maxNumberOfKeys,
      keyPrice,
      name,
    } = this.state

    const lock = {
      address: uniqid(), // The lock does not have an address yet, so we use a 'temporary' one
      name: name,
      expirationDuration: expirationDuration * expirationDurationUnit,
      keyPrice: Web3Utils.toWei(keyPrice.toString(10), keyPriceCurrency),
      maxNumberOfKeys,
      owner: account.address,
    }

    createLock(lock)
    if (hideAction) hideAction()
  }

  handleCancel() {
    const { hideAction } = this.props
    if (hideAction) hideAction()
  }

  render() {
    const { expirationDuration, maxNumberOfKeys, keyPrice, name } = this.state

    return (
      <FormLockRow>
        <Icon />
        <FormLockName>
          <input
            type="text"
            name="name"
            onChange={this.handleChange}
            defaultValue={name}
          />
        </FormLockName>
        <FormLockDuration>
          <input
            type="text"
            name="expirationDuration"
            onChange={this.handleChange}
            defaultValue={expirationDuration}
          />
          {' '}
          days
        </FormLockDuration>
        <FormLockKeys>
          <input
            type="text"
            name="maxNumberOfKeys"
            onChange={this.handleChange}
            defaultValue={maxNumberOfKeys}
          />
        </FormLockKeys>
        <FormBalanceWithUnit>
          <Eth />
          <input
            type="text"
            name="keyPrice"
            onChange={this.handleChange}
            defaultValue={keyPrice}
          />
        </FormBalanceWithUnit>
        <div>-</div>
        <Status>
          <Button onClick={this.handleSubmit}>Submit</Button>
          <Button cancel onClick={this.handleCancel}>
            Cancel
          </Button>
        </Status>
      </FormLockRow>
    )
  }
}

CreatorLockForm.propTypes = {
  account: UnlockPropTypes.account.isRequired,
  hideAction: PropTypes.func.isRequired,
  createLock: PropTypes.func.isRequired,
}

CreatorLockForm.defaultProps = {}

const mapStateToProps = state => {
  return {
    account: state.account,
  }
}

const mapDispatchToProps = dispatch => ({
  createLock: lock => dispatch(createLock(lock)),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreatorLockForm)

const FormLockRow = styled(LockRow)`
  ${LockRowGrid} input[type='text'] {
    background-color: var(--lightgrey);
    border: 0;
    padding: 5px;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 13px;
  }
  ${LockRowGrid} input[type='text'][data-valid="false"] {
    background-color: var(--lightred);
  }
`

const Status = styled(LockStatus)`
  padding-bottom: 15px;
`

const FormLockName = styled(LockName)`
  input[type='text'] {
    min-width: 70px;
    width: 80%;
  }
`

const FormLockDuration = styled(LockDuration)`
  input[type='text'] {
    min-width: 30px;
    width: 50%;
  }
`

const FormLockKeys = styled(LockKeys)`
  input[type='text'] {
    min-width: 30px;
    width: 80%;
  }
`

const FormBalanceWithUnit = styled(BalanceWithUnit)`
  white-space: nowrap;
  input[type='text'] {
    min-width: 30px;
    width: 50%;
  }
`

const Button = styled.button`
  cursor: pointer;
  font: inherit;
  font-size: ${props => (props.cancel ? '10px' : '13px')};
  align-self: ${props => (props.cancel ? 'center' : 'end')};
  background: none;
  color: inherit;
  border: none;
  outline: inherit;
  padding 0;
`
