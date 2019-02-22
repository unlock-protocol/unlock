import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import UnlockPropTypes from '../../propTypes'

import Icon from '../lock/Icon'
import { BalanceWithUnit, Eth } from '../helpers/Balance'
import {
  LockRow,
  LockName,
  LockLabel,
  LockDuration,
  LockKeys,
} from './LockStyles'
import { LockStatus } from './lock/CreatorLockStatus'
import { setError, resetError } from '../../actions/error'
import {
  FORM_LOCK_NAME_MISSING,
  FORM_EXPIRATION_DURATION_INVALID,
  FORM_MAX_KEYS_INVALID,
  FORM_KEY_PRICE_INVALID,
} from '../../errors'
import {
  isNotEmpty,
  isPositiveInteger,
  isPositiveNumber,
} from '../../utils/validators'

import { INFINITY, UNLIMITED_KEYS_COUNT } from '../../constants'

export class CreatorLockForm extends React.Component {
  constructor(props, context) {
    super(props, context)
    let expirationDuration = props.expirationDuration
    let keyPrice = props.keyPrice
    let maxNumberOfKeys = props.maxNumberOfKeys
    // these try/catch blocks are designed to allow us to accept
    // a wide range of both valid and invalid input
    // and use the form itself to display invalid values
    // keeping with the principle of accepting as much as possible
    // and being strict in what data we send out
    try {
      if (!keyPrice.match(/^[0-9]+$/)) {
        keyPrice = props.keyPrice
      }
    } catch (e) {
      // silently ignore invalid value, leave as what the original was
      keyPrice = props.keyPrice
    }
    try {
      expirationDuration =
        parseInt(expirationDuration) / props.expirationDurationUnit
      if (isNaN(expirationDuration)) {
        expirationDuration = props.expirationDuration
      }
    } catch (e) {
      // silently ignore invalid value, leave as what the original was
      expirationDuration = props.expirationDuration
    }
    // unlimited keys is represented differently in the frontend and the backend,
    // so when a lock has `maxNumberOfKeys` set to UNLIMITED_KEYS_COUNT,
    // convert it to infinity symbol for frontend display
    if (maxNumberOfKeys === UNLIMITED_KEYS_COUNT) {
      maxNumberOfKeys = INFINITY
    }
    this.state = {
      expirationDuration: expirationDuration,
      expirationDurationUnit: props.expirationDurationUnit, // Days
      keyPrice: keyPrice,
      maxNumberOfKeys,
      unlimitedKeys: maxNumberOfKeys === INFINITY,
      name: props.name,
      address: props.address,
    }
    const { validityState: valid, errors } = this.formValidity(this.state)
    this.state.valid = valid
    this.state.errors = errors
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleUnlimitedClick = this.handleUnlimitedClick.bind(this)
    this.saveLock = this.saveLock.bind(this)
    this.processFormErrors = this.sendErrorsToRedux.bind(this)
  }

  /**
   * Traverses each form field and verifies its validity.
   * returns a hash of fields to error message and all errors triggered.
   * valid fields hash to the value false
   * invalid fields hash to the error constant (a string) that represents the error condition
   */
  formValidity(state) {
    // the list of errors we will pass to setError
    const errors = []
    // for each field, retrieve the error triggered by current state
    // and then make sure we set it as existing.
    const validityState = [
      'expirationDuration',
      //'expirationDurationUnit',
      'keyPrice',
      'maxNumberOfKeys',
      'name',
    ].reduce((fieldValidity, field) => {
      // invalidError will either be the error name or false
      const invalidError = this.validate(field, state[field])
      fieldValidity[field] = !invalidError
      if (!invalidError) {
        return fieldValidity
      }
      errors.push(invalidError)
      return fieldValidity
    }, {})

    // the form can be submitted if and only if there are no errors triggered by any field
    validityState.formValid = errors.length === 0
    return { validityState, errors }
  }

  /**
   * validate an individual form field
   */
  validate(name, value) {
    switch (name) {
      case 'name':
        if (!isNotEmpty(value)) {
          return FORM_LOCK_NAME_MISSING
        }
        break
      case 'expirationDuration':
        if (!isPositiveInteger(value)) return FORM_EXPIRATION_DURATION_INVALID
        break
      case 'maxNumberOfKeys':
        if (value !== INFINITY && !isPositiveInteger(value)) {
          return FORM_MAX_KEYS_INVALID
        }
        break
      case 'keyPrice':
        if (!isPositiveNumber(value)) {
          return FORM_KEY_PRICE_INVALID
        }
        break
    }
    return false
  }

  saveLock() {
    const { account, createLock } = this.props
    const {
      expirationDuration,
      expirationDurationUnit,
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
      keyPrice: keyPrice.toString(10), // In Eth
      maxNumberOfKeys: unlimitedKeys ? UNLIMITED_KEYS_COUNT : maxNumberOfKeys,
      owner: account.address,
      unlimitedKeys,
    }

    createLock(lock)
  }

  /**
   * calculate form errors, and propagate them to redux
   */
  sendErrorsToRedux(state) {
    const { validityState: valid, errors } = this.formValidity(state)
    const { setError, resetError } = this.props
    const allFormErrors = [
      FORM_EXPIRATION_DURATION_INVALID,
      FORM_KEY_PRICE_INVALID,
      FORM_MAX_KEYS_INVALID,
      FORM_LOCK_NAME_MISSING,
    ]
    allFormErrors.forEach(error => {
      if (errors.indexOf(error) >= 0) {
        setError(error)
      } else {
        resetError(error)
      }
    })
    return { valid, errors }
  }

  handleUnlimitedClick() {
    this.setState(state => ({
      ...state,
      unlimitedKeys: true,
      maxNumberOfKeys: INFINITY,
      valid: this.formValidity({ ...state, [name]: INFINITY }),
    }))
  }

  handleChange({ target: { name, value } }) {
    this.setState(state => ({
      unlimitedKeys:
        name === 'maxNumberOfKeys' ? value === INFINITY : state.unlimitedKeys,
      [name]: value,
      valid: this.formValidity({ ...state.valid, [name]: value }),
    }))
  }

  handleSubmit() {
    this.setState(state => {
      const { valid, errors } = this.sendErrorsToRedux(state)
      if (!valid.formValid) return { valid, errors }
      const { hideAction } = this.props
      if (hideAction) hideAction()
      return this.saveLock(state, valid, errors)
    })
  }

  handleCancel() {
    const { hideAction } = this.props
    if (hideAction) hideAction()
  }

  render() {
    const { pending } = this.props
    const {
      expirationDuration,
      maxNumberOfKeys,
      keyPrice,
      name,
      unlimitedKeys,
      valid,
    } = this.state

    // NOTE: maxNumberOfKeys must be a text input in order to support the infinity symbol
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
            required={pending}
            disabled={!pending}
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
            required={pending}
            disabled={!pending}
          />{' '}
          days
        </FormLockDuration>
        <FormLockKeys>
          <input
            type="text"
            name="maxNumberOfKeys"
            onChange={this.handleChange}
            value={maxNumberOfKeys}
            data-valid={valid.maxNumberOfKeys}
            required={pending}
            disabled={!pending}
          />
          {pending && !unlimitedKeys && (
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
  setError: PropTypes.func.isRequired,
  resetError: PropTypes.func.isRequired,
  expirationDuration: PropTypes.number,
  expirationDurationUnit: PropTypes.number,
  keyPrice: PropTypes.string,
  maxNumberOfKeys: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // string is for '∞'
  name: PropTypes.string,
  address: PropTypes.string,
  pending: PropTypes.bool,
}

CreatorLockForm.defaultProps = {
  expirationDuration: 30 * 86400,
  expirationDurationUnit: 86400, // Days
  keyPrice: '0.01',
  maxNumberOfKeys: 10,
  name: 'New Lock',
  pending: false,
  address: null,
}

const mapStateToProps = state => {
  return {
    account: state.account,
  }
}

const mapDispatchToProps = { setError, resetError }

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
    border: 1px solid var(--lightgrey);
    border-radius: 4px;
    height: 26px;
    padding: 0 8px;
    font-family: 'IBM Plex Mono', sans serif;
    font-size: 14px;
    font-weight: 200;
  }

  input:focus {
    outline: none;
    border: 1px solid var(--grey);
    transition: border 100ms ease;
  }

  input[data-valid='false'] {
    border: 1px solid var(--red);
  }

  input:disabled {
    color: var(--silver);
  }

  @keyframes slideIn {
    0% {
      transform: translateY(-50%);
      opacity: 0;
      }
    }
    100% {
      transform: translateY(0);
      opacity: 1;
      }
    }
    animation: 400ms ease slideIn;
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
    text-align: right;
  }
`

const FormLockKeys = styled(LockKeys)`
  input[type='text'],
  input[type='number'] {
    min-width: 30px;
    width: 80%;
    text-align: right;
  }
`

const FormBalanceWithUnit = styled(BalanceWithUnit)`
  white-space: nowrap;
  input[type='text'],
  input[type='number'] {
    min-width: 30px;
    width: 77%;
    padding-right: 0;
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
  & :hover {
    color: #333;
    transition: color 100ms ease;
  }
`
