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
  LockLabel,
  LockDuration,
  LockKeys,
} from './CreatorLock'
import { LockStatus } from './lock/CreatorLockStatus'
import { createLock } from '../../actions/lock'

export class CreatorLockForm extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      expirationDuration: props.expirationDuration,
      expirationDurationUnit: props.expirationDurationUnit, // Days
      keyPrice: props.keyPrice,
      keyPriceCurrency: props.keyPriceCurrency,
      maxNumberOfKeys: props.maxNumberOfKeys,
      unlimitedKeys: props.maxNumberOfKeys === '∞',
      name: props.name,
      address: props.address,
    }
    this.state.valid = {
      name: this.validate('name', props.name),
      expirationDuration: this.validate(
        'expirationDuration',
        props.expirationDuration
      ),
      keyPrice: this.validate('keyPrice', props.keyPrice),
      maxNumberOfKeys: this.validate('maxNumberOfKeys', props.maxNumberOfKeys),
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleUnlimitedClick = this.handleUnlimitedClick.bind(this)
  }

  validate(name, value) {
    return (
      (name === 'name' && typeof value === 'string' && value.length > 0) ||
      ((name === 'expirationDuration' || name === 'maxNumberOfKeys') &&
        !isNaN(value) &&
        value > 0) ||
      (name === 'maxNumberOfKeys' && value === '∞') ||
      (name === 'keyPrice' && !isNaN(value) && value >= 0)
    )
  }

  saveLock() {
    const { account, createLock } = this.props
    const {
      expirationDuration,
      expirationDurationUnit,
      keyPriceCurrency,
      maxNumberOfKeys,
      unlimitedKeys,
      keyPrice,
      name,
      address,
    } = this.state

    const lock = {
      address: address,
      name: name,
      expirationDuration: expirationDuration * expirationDurationUnit,
      keyPrice: Web3Utils.toWei(keyPrice.toString(10), keyPriceCurrency),
      maxNumberOfKeys: unlimitedKeys ? 0 : maxNumberOfKeys,
      owner: account.address,
    }

    createLock(lock)
  }

  handleUnlimitedClick() {
    this.setState(state => ({
      ...state,
      valid: {
        ...state.valid,
        maxNumberOfKeys: true,
      },
      unlimitedKeys: true,
      maxNumberOfKeys: '∞',
    }))
  }

  handleChange({ target: { name, value } }) {
    if (name === 'maxNumberOfKeys') {
      this.setState(state => ({
        ...state,
        valid: {
          ...state.valid,
          maxNumberOfKeys: value === '∞' ? true : this.validate(name, value),
        },
        maxNumberOfKeys: value,
        unlimitedKeys: value === '∞',
      }))
    } else {
      this.setState(state => ({
        ...state,
        valid: { ...state.valid, [name]: this.validate(name, value) },
        [name]: value,
      }))
    }
  }

  handleSubmit() {
    const { valid } = this.state
    if (Object.keys(valid).filter(key => !valid[key]).length) return false

    this.saveLock()
    const { hideAction } = this.props
    if (hideAction) hideAction()
  }

  handleCancel() {
    const { hideAction } = this.props
    if (hideAction) hideAction()
  }

  render() {
    const {
      expirationDuration,
      maxNumberOfKeys,
      keyPrice,
      name,
      unlimitedKeys,
      valid,
    } = this.state

    return (
      <FormLockRow>
        <Icon />
        <FormLockName>
          <input
            type="text"
            name="name"
            onChange={this.handleChange}
            defaultValue={name}
            data-valid={valid.name}
            required
          />
        </FormLockName>
        <FormLockDuration>
          <input
            type="number"
            step="1"
            inputMode="numeric"
            name="expirationDuration"
            onChange={this.handleChange}
            defaultValue={expirationDuration}
            data-valid={valid.expirationDuration}
            required
          />{' '}
          days
        </FormLockDuration>
        <FormLockKeys>
          <input
            type="number"
            step="1"
            inputMode="numeric"
            name="maxNumberOfKeys"
            onChange={this.handleChange}
            value={maxNumberOfKeys}
            data-valid={valid.maxNumberOfKeys}
            required
          />
          {!unlimitedKeys && (
            <LockLabelUnlimited onClick={this.handleUnlimitedClick}>
              Unlimited
            </LockLabelUnlimited>
          )}
        </FormLockKeys>
        <FormBalanceWithUnit>
          <Eth />
          <input
            type="number"
            step="0.00001"
            inputMode="numeric"
            name="keyPrice"
            onChange={this.handleChange}
            defaultValue={keyPrice}
            data-valid={valid.keyPrice}
            required
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
  expirationDuration: PropTypes.number,
  expirationDurationUnit: PropTypes.number,
  keyPrice: PropTypes.string,
  keyPriceCurrency: PropTypes.string,
  maxNumberOfKeys: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // string is for '∞'
  name: PropTypes.string,
  address: PropTypes.string,
}

CreatorLockForm.defaultProps = {
  expirationDuration: 30,
  expirationDurationUnit: 86400, // Days
  keyPrice: '0.01',
  keyPriceCurrency: 'ether',
  maxNumberOfKeys: 10,
  name: 'New Lock',
  address: uniqid(), // for new locks, we don't have an address, so use a temporary one
}

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

const LockLabelUnlimited = styled(LockLabel)`
  font-size: 11px;
  width: 100%;
  padding: 5px;
`

const FormLockRow = styled(LockRow)`
  input[type='number'] {
    -moz-appearance: textfield;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input {
    background: var(--lightgrey);
    border: none;
    border-radius: 4px;
    height: 21.5px;
    font-family: 'IBM Plex Mono', sans serif;
  }

  input:focus {
    border: 1px solid var(--grey);
  }

  input[data-valid='false'] {
    border: 1px solid var(--red);
  }
`

const Status = styled(LockStatus)`
  padding-bottom: 15px;
`

const FormLockName = styled(LockName)`
  input[type='text'],
  input[type='number'] {
    min-width: 70px;
    width: 80%;
  }
`

const FormLockDuration = styled(LockDuration)`
  input[type='text'],
  input[type='number'] {
    min-width: 30px;
    width: 50%;
  }
`

const FormLockKeys = styled(LockKeys)`
  input[type='text'],
  input[type='number'] {
    min-width: 30px;
    width: 80%;
  }
`

const FormBalanceWithUnit = styled(BalanceWithUnit)`
  white-space: nowrap;
  input[type='text'],
  input[type='number'] {
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
