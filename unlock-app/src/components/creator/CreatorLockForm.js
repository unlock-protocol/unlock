import PropTypes from 'prop-types'
import React, { useContext, useReducer } from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../propTypes'
import { ConfigContext } from '../../utils/withConfig'
import { currencySymbol } from '../../utils/lock'

import {
  DoubleHeightCell,
  LockDetails,
  LockRow,
  LockName,
  LockLabel,
  LockDuration,
  LockKeys,
} from './LockStyles'

import Icon from '../lock/Icon'
import { BalanceWithUnit, ERC20 } from '../helpers/Balance'

import { LockStatus } from './lock/CreatorLockStatus'
import {
  isNotEmpty,
  isPositiveInteger,
  isPositiveNumber,
  isPositiveIntegerOrZero,
  isLTE,
} from '../../utils/validators'

import {
  INFINITY,
  UNLIMITED_KEYS_COUNT,
  ONE_HUNDRED_YEARS_IN_SECONDS,
} from '../../constants'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'

const CreatorLockForm = ({ hideAction, lock, saveLock }) => {
  const config = useContext(ConfigContext)
  const { network } = useContext(AuthenticationContext)

  const lockDefaults = {
    expirationDuration: 30 * 86400, // 30 days in seconds
    keyPrice: '0.01',
    maxNumberOfKeys: 100,
    currency: null,
    address: null,
    name: 'New Lock',
    ...lock,
  }

  const [lockInForm, dispatch] = useReducer((state, action) => {
    if (action.change) {
      const newState = { ...state }
      action.change.forEach((change) => {
        newState[change.name] = change.value
      })
      return newState
    }
    return { ...state }
  }, lockDefaults)

  const isNew = !lockInForm.address

  // Set up the ERC20 address, based on query string or defaults to config.
  const erc20 = config.networks[network].erc20 || {}
  const baseCurrencySymbol = config.networks[network].baseCurrencySymbol
  const url = new window.URL(document.location)
  if (url.searchParams.get('erc20')) {
    erc20.address = url.searchParams.get('erc20')
    erc20.symbol = url.searchParams.get('ticker') || 'ERC20'
  }

  const validateAndDispatch = (field, change) => {
    const valid = change.reduce((valid, { name, value }) => {
      return validate(name, value)
    }, '')
    field.setCustomValidity(valid)
    dispatch({ change })
  }

  const handleChange = ({ target }) => {
    const { name, value } = target
    validateAndDispatch(target, [{ name, value }])
  }

  const handleChangeExpirationDuration = ({ target }) => {
    const { name, value } = target
    validateAndDispatch(target, [{ name, value: value * (60 * 60 * 24) }])
  }

  const handleUnlimitedNumbersOfKeys = () => {
    dispatch({
      change: [{ name: 'maxNumberOfKeys', value: UNLIMITED_KEYS_COUNT }],
    })
  }

  const handleUnlimitedDuration = () => {
    dispatch({
      change: [
        { name: 'expirationDuration', value: ONE_HUNDRED_YEARS_IN_SECONDS },
      ],
    })
  }

  const toggleCurrency = () => {
    const erc20Address = lockInForm.currencyContractAddress
      ? null
      : erc20.address
    const erc20Symbol = lockInForm.currencyContractAddress ? null : erc20.symbol
    dispatch({
      change: [
        { name: 'currencyContractAddress', value: erc20Address },
        { name: 'currencySymbol', value: erc20Symbol },
      ],
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    saveLock(lockInForm)
  }

  const validate = (name, value) => {
    switch (name) {
      case 'name':
        if (!isNotEmpty(value)) {
          return 'Make sure your lock has a name!'
        }
        break
      case 'expirationDuration':
        if (!isPositiveInteger(value)) {
          return 'The expiration duration for each key must be greater than 0'
        }
        break
      case 'maxNumberOfKeys':
        if (!isPositiveNumber(value) && value !== INFINITY) {
          return 'The number of keys needs to be greater than 0'
        }
        if (parseInt(value, 10) <= lock.outstandingKeys) {
          return `The number of keys needs to be greater than existing number of keys (${lock.outstandingKeys})`
        }
        break
      case 'keyPrice':
        if (!isPositiveNumber(value)) {
          return 'The price needs to be greater than 0'
        }
        break
    }
    return ''
  }

  const expirationDurationValue =
    lockInForm?.expirationDuration === ONE_HUNDRED_YEARS_IN_SECONDS
      ? INFINITY
      : isPositiveIntegerOrZero(lockInForm.expirationDuration)
      ? lockInForm.expirationDuration / (60 * 60 * 24)
      : ''

  return (
    <form method="post" onSubmit={handleSubmit}>
      <FormLockRow>
        <FormLockDetails className="lockForm" data-address={lockInForm.address}>
          <DoubleHeightCell>
            <Icon lock={lockInForm} />
          </DoubleHeightCell>
          <FormLockName>
            <input
              type="text"
              name="name"
              onChange={handleChange}
              defaultValue={lockInForm.name}
              required={isNew}
              disabled={!isNew}
            />
          </FormLockName>
          <FormLockDuration>
            <input
              type="text"
              inputMode="numeric"
              name="expirationDuration"
              onChange={handleChangeExpirationDuration}
              value={expirationDurationValue}
              required={isNew}
              disabled={!isNew}
            />{' '}
            days
            {lockInForm?.expirationDuration !== ONE_HUNDRED_YEARS_IN_SECONDS &&
              isNew && (
                <LockLabelUnlimited onClick={handleUnlimitedDuration}>
                  Unlimited
                </LockLabelUnlimited>
              )}
          </FormLockDuration>
          <FormLockKeys>
            <input
              type="text"
              name="maxNumberOfKeys"
              onChange={handleChange}
              value={
                lockInForm?.maxNumberOfKeys === UNLIMITED_KEYS_COUNT
                  ? INFINITY
                  : lockInForm?.maxNumberOfKeys
              }
              required={isNew}
            />
            {lockInForm?.maxNumberOfKeys !== UNLIMITED_KEYS_COUNT && (
              <LockLabelUnlimited onClick={handleUnlimitedNumbersOfKeys}>
                Unlimited
              </LockLabelUnlimited>
            )}
          </FormLockKeys>
          <FormBalanceWithUnit>
            {!lockInForm.currencyContractAddress && (
              <ERC20 name={baseCurrencySymbol} />
            )}
            {!!lockInForm.currencyContractAddress && (
              <ERC20 name={lockInForm.currencySymbol} />
            )}
            <input
              type="number"
              step="0.00001"
              inputMode="numeric"
              name="keyPrice"
              onChange={handleChange}
              defaultValue={lockInForm.keyPrice}
              required
            />
            {isNew && erc20.symbol && !lockInForm.currencyContractAddress && (
              <LockLabelCurrency onClick={toggleCurrency}>
                Use {erc20.symbol}
              </LockLabelCurrency>
            )}
            {isNew && erc20.symbol && !!lockInForm.currencyContractAddress && (
              <LockLabelCurrency onClick={toggleCurrency}>
                Use {baseCurrencySymbol}
              </LockLabelCurrency>
            )}
          </FormBalanceWithUnit>

          <div>-</div>
          <Status>
            <Button type="submit">Submit</Button>
            <Button cancel onClick={hideAction}>
              Cancel
            </Button>
          </Status>
        </FormLockDetails>
      </FormLockRow>
    </form>
  )
}

CreatorLockForm.propTypes = {
  hideAction: PropTypes.func.isRequired,
  saveLock: PropTypes.func.isRequired,
  lock: UnlockPropTypes.lock,
}

CreatorLockForm.defaultProps = {
  lock: {},
}

export default CreatorLockForm

const LockLabelUnlimited = styled(LockLabel)`
  cursor: pointer;
  font-size: 11px;
  width: 100%;
  padding: 5px;
  padding-left: 0px;
`

const LockLabelCurrency = styled(LockLabel).attrs(() => ({
  className: 'currency',
}))`
  font-size: 11px;
  cursor: pointer;
  width: 100%;
  padding: 5px 0 0 0;
`

const FormLockRow = styled(LockRow)`
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
  }`

const FormLockDetails = styled(LockDetails)`
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
    border: 1px solid var(--offwhite);
    border-radius: 4px;
    height: 26px;
    padding: 0 8px;
    font-family: 'IBM Plex Mono', sans serif;
    font-size: 14px;
    font-weight: 200;
  }

  input[data-valid='false'] {
    border: 1px solid var(--red);
  }

  input:disabled {
    color: var(--silver);
  }
`

const Status = styled(LockStatus)`
  padding-bottom: 15px;
  background-color: var(--green);
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
    width: 60px;
    padding-right: 0;
  }
`

const Button = styled.button`
  cursor: pointer;
  font: inherit;
  font-size: ${(props) => (props.cancel ? '10px' : '13px')};
  align-self: ${(props) => (props.cancel ? 'center' : 'end')};
  background: none;
  color: var(--white);
  border: none;
  outline: inherit;
  padding 0;
  &:hover {
    color: #333;
    transition: color 100ms ease;
  }
`
