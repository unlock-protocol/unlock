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

/**
 * Converts the lock values into form values
 * @param {*} lockValues
 */
export const lockToFormValues = lockValues => {
  const formValues = Object.assign({}, lockValues)

  // In the form, duration is shown in days, vs seconds in the lock object
  formValues.expirationDuration =
    lockValues.expirationDuration / lockValues.expirationDurationUnit

  // Unlimited keys
  if (lockValues.maxNumberOfKeys === UNLIMITED_KEYS_COUNT) {
    formValues.unlimitedKeys = true
    formValues.maxNumberOfKeys = INFINITY
  }

  return formValues
}

/**
 * Converts the form values into lock values
 * @param {*} lockValues
 */
export const formValuesToLock = formValues => {
  const lockValues = {}

  lockValues.keyPrice = formValues.keyPrice
  lockValues.maxNumberOfKeys = formValues.maxNumberOfKeys
  lockValues.name = formValues.name
  lockValues.address = formValues.address

  // In the form, duration is shown in days, vs seconds in the lock object
  lockValues.expirationDuration =
    formValues.expirationDuration * formValues.expirationDurationUnit

  // Unlimited keys
  if (formValues.unlimitedKeys) {
    lockValues.maxNumberOfKeys = UNLIMITED_KEYS_COUNT
  }

  return lockValues
}

export class CreatorLockForm extends React.Component {
  /**
   *
   * @param {*} props
   * @param {*} context
   */
  constructor(props, context) {
    super(props, context)

    const newLockDefaults = {
      expirationDuration: 30 * 86400, // 30 days in seconds
      expirationDurationUnit: 86400, // days
      keyPrice: '0.01',
      maxNumberOfKeys: 10,
      name: 'New Lock',
      address: null,
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleUnlimitedClick = this.handleUnlimitedClick.bind(this)
    this.saveLock = this.saveLock.bind(this)
    this.processFormErrors = this.sendErrorsToRedux.bind(this)

    // State represents the values in the form... and we may get a different format for them
    this.state = lockToFormValues(Object.assign(newLockDefaults, props.lock))

    const { validityState: valid, errors } = this.formValidity(this.state)
    this.state.valid = valid
    this.state.errors = errors
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
    const { account, saveLock } = this.props
    const newLock = formValuesToLock(this.state)
    saveLock({
      ...newLock,
      owner: account.address,
    })
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
      return this.saveLock(state, valid, errors)
    })
  }

  handleCancel() {
    const { hideAction } = this.props
    if (hideAction) hideAction()
  }

  render() {
    const { lock } = this.props
    const isNew = !lock || !lock.address
    const {
      expirationDuration,
      maxNumberOfKeys,
      keyPrice,
      name,
      unlimitedKeys,
      valid,
    } = this.state
    const lockAddress = lock ? lock.address : ''
    // NOTE: maxNumberOfKeys must be a text input in order to support the infinity symbol
    return (
      <FormLockRow className="lockForm" data-address={lockAddress}>
        <Icon />
        <FormLockName>
          <input
            type="text"
            name="name"
            onChange={this.handleChange}
            defaultValue={name}
            data-valid={valid.name}
            required={isNew}
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
            required={isNew}
            disabled={!isNew}
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
            required={isNew}
            disabled={!isNew}
          />
          {isNew && !unlimitedKeys && (
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
  saveLock: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  resetError: PropTypes.func.isRequired,
  lock: UnlockPropTypes.lock,
}

CreatorLockForm.defaultProps = {
  lock: {},
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
