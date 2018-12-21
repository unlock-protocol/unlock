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
  LockRowGrid,
} from './CreatorLock'
import { LockStatus } from './lock/CreatorLockStatus'
import { createLock, updateLockPrice } from '../../actions/lock'

class CreatorLockForm extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      expirationDuration: 30,
      expirationDurationUnit: 86400, // Days
      keyPrice: '0.01',
      keyPriceCurrency: 'ether',
      maxNumberOfKeys: 10,
      unlimitedKeys: false,
      name: 'New Lock',
      editing: props.lock !== null,
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleUnlimitedClick = this.handleUnlimitedClick.bind(this)
    this.maxNumberOfKeysRef = React.createRef()
    this.toggleEditing = this.toggleEditing.bind(this)
  }

  toggleEditing() {
    this.setState(previousState => ({
      editing: !previousState.editing,
    }))
  }

  validate(name, value) {
    let { unlimitedKeys } = this.state
    return (
      (name === 'name' && typeof value === 'string' && value.length > 0) ||
      ((name === 'expirationDuration' || name === 'maxNumberOfKeys') &&
        !isNaN(value) &&
        value > 0) ||
      (name === 'maxNumberOfKeys' && value === '∞' && unlimitedKeys) ||
      (name === 'keyPrice' && !isNaN(value) && value >= 0)
    )
  }

  handleUnlimitedClick() {
    this.setState({ unlimitedKeys: true, maxNumberOfKeys: '∞' })
    // Marking the maxNumberOfKeysRef field as valid.
    this.maxNumberOfKeysRef.current.dataset.valid = true
  }

  handleChange(event) {
    let { name, value, dataset } = event.target

    if (name === 'maxNumberOfKeys') {
      dataset.valid = value === '∞' ? true : this.validate(name, value)
      this.setState({ unlimitedKeys: value === '∞' })
    } else {
      dataset.valid = this.validate(name, value)
    }

    this.setState({ [name]: value })
  }

  handleSubmit() {
    if (document.querySelector('[data-valid="false"]')) return false

    const {
      account,
      createLock,
      hideAction,
      updateLockPrice,
      lock,
    } = this.props

    const {
      expirationDuration,
      expirationDurationUnit,
      keyPriceCurrency,
      maxNumberOfKeys,
      unlimitedKeys,
      keyPrice,
      name,
      editing,
    } = this.state

    const weiPrice = Web3Utils.toWei(keyPrice.toString(10), keyPriceCurrency)

    if (editing) return updateLockPrice({ ...lock, keyPrice: weiPrice })

    createLock({
      address: uniqid(), // The lock does not have an address yet, so we use a 'temporary' one
      name: name,
      expirationDuration: expirationDuration * expirationDurationUnit,
      keyPrice: weiPrice,
      maxNumberOfKeys: unlimitedKeys ? 0 : maxNumberOfKeys,
      owner: account.address,
    })

    if (hideAction) hideAction()
  }

  handleCancel() {
    const { hideAction, cancelEdit } = this.props
    if (cancelEdit) cancelEdit()
    if (hideAction) hideAction()
  }

  render() {
    const {
      expirationDuration,
      maxNumberOfKeys,
      keyPrice,
      name,
      unlimitedKeys,
      editing,
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
            disabled={editing}
          />
        </FormLockName>
        <FormLockDuration>
          <input
            type="text"
            name="expirationDuration"
            onChange={this.handleChange}
            defaultValue={expirationDuration}
            disabled={editing}
          />{' '}
          days
        </FormLockDuration>
        <FormLockKeys>
          <input
            ref={this.maxNumberOfKeysRef}
            type="text"
            name="maxNumberOfKeys"
            onChange={this.handleChange}
            value={maxNumberOfKeys}
            defaultValue={maxNumberOfKeys}
            disabled={editing}
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
            type="text"
            name="keyPrice"
            onChange={this.handleChange}
            defaultValue={keyPrice}
          />
        </FormBalanceWithUnit>
        <div>-</div>
        <Status>
          <Button onClick={this.handleSubmit}>
            {editing && 'Update'}
            {editing || 'Submit'}
          </Button>
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
  hideAction: PropTypes.func,
  createLock: PropTypes.func.isRequired,
  updateLockPrice: PropTypes.func.isRequired,
  lock: UnlockPropTypes.lock,
  cancelEdit: PropTypes.func,
}

CreatorLockForm.defaultProps = {
  lock: null,
  cancelEdit: null,
  hideAction: null,
}

const mapStateToProps = state => {
  return {
    account: state.account,
  }
}

const mapDispatchToProps = dispatch => ({
  createLock: lock => dispatch(createLock(lock)),
  updateLockPrice: lock => dispatch(updateLockPrice(lock)),
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
