import PropTypes from 'prop-types'
import UnlockPropTypes from '../../propTypes'

import React from 'react'
import styled from 'styled-components'
import Icon from '../lock/Icon'
import { BalanceWithUnit, Unit } from '../helpers/Balance'
import { LockRow, LockName, LockDuration, LockKeys } from './CreatorLock'
import { LockStatus } from './lock/CreatorLockConfirming'
import Svg from '../interface/svg'
import Web3Utils from 'web3-utils'
import {createLock} from '../../actions/lock'
import connect from 'react-redux/es/connect/connect'

class CreatorLockForm extends React.Component {
  constructor (props, context) {
    super(props)
    this.state = {
      keyReleaseMechanism: 0, // Public
      expirationDuration: 30,
      expirationDurationUnit: 86400, // Days
      keyPrice: '0.01',
      keyPriceCurrency: 'ether',
      maxNumberOfKeys: 10,
      name: 'New Lock'
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (event) {
    this.setState({ [event.target.id]: event.target.value })
  }

  handleSubmit () { // TODO save name to the redux store
    const lockParams = {
      keyReleaseMechanism: this.state.keyReleaseMechanism,
      expirationDuration: this.state.expirationDuration * this.state.expirationDurationUnit,
      keyPrice: Web3Utils.toWei(this.state.keyPrice.toString(10), this.state.keyPriceCurrency),
      maxNumberOfKeys: this.state.maxNumberOfKeys,
      creator: this.props.account,
    }
    this.props.createLock(lockParams)
    if (this.props.hideAction) this.props.hideAction()
  }

  render() {
    return (
      <FormLockRow>
        <Icon address={'00000000000000'} />
        <FormLockName>
          <input type={'text'} id={'name'} onChange={this.handleChange} defaultValue={this.state.name} />
        </FormLockName>
        <FormLockDuration>
          <input type={'text'} id={'expirationDuration'} onChange={this.handleChange} defaultValue={this.state.expirationDuration} /> days
        </FormLockDuration>
        <FormLockKeys>
          <input type={'text'} id={'maxNumberOfKeys'} onChange={this.handleChange} defaultValue={this.state.maxNumberOfKeys} />
        </FormLockKeys>
        <FormBalanceWithUnit>
          <Unit>
            <Svg.Eth width="1em" height="1em" />
          </Unit>
          <input type={'text'} id={'keyPrice'} onChange={this.handleChange} defaultValue={this.state.keyPrice} />
        </FormBalanceWithUnit>
        <div></div>
        <LockSubmit onClick={this.handleSubmit}>
          Submit
        </LockSubmit>
      </FormLockRow>
    )
  }
}

CreatorLockForm.propTypes = {
  lock: UnlockPropTypes.lock,
  hideAction: PropTypes.func,
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
  input[type=text] {
    width: 30px;
  }
  ${Unit} {
    padding-bottom: 5px;
  }
`

const LockSubmit = styled(LockStatus)`
  cursor: pointer;
  text-align: center;
`
