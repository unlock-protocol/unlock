import React from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../propTypes'

import { getLockTransaction } from '../../helpers/locks'
import CreatorLock, { LockRowGrid } from './CreatorLock'
import CreatorLockForm from './CreatorLockForm'

export class CreatorLocks extends React.Component {
  constructor (props, context) {
    super(props)
    this.state = {
      showDashboardForm: !!this.props.showForm,
    }
    this.toggleForm = this.toggleForm.bind(this)
  }

  toggleForm() {
    this.setState({
      showDashboardForm: !this.state.showDashboardForm,
    })
  }

  render() {
    return (
      <Locks>
        <LockHeaderRow>
          <LockHeader>Locks</LockHeader>
          <LockMinorHeader>Name / Address</LockMinorHeader>
          <LockMinorHeader>Duration</LockMinorHeader>
          <LockMinorHeader>Quantity</LockMinorHeader>
          <LockMinorHeader>Price</LockMinorHeader>
          <LockMinorHeader>Balance / Earnings</LockMinorHeader>
          <CreateButton onClick={this.toggleForm}>Create Lock</CreateButton>
        </LockHeaderRow>
        {this.state.showDashboardForm && <CreatorLockForm hideAction={this.toggleForm} />}
        {Object.values(this.props.locks).map((lock, index) => {
          let transaction = getLockTransaction(this.props.transactions, lock.id)
          return (<CreatorLock key={index} lock={lock} transaction={transaction} />)
        })}
      </Locks>
    )
  }
}

CreatorLocks.propTypes = {
  transactions: UnlockPropTypes.transactions,
  locks: UnlockPropTypes.locks,
  showForm: UnlockPropTypes.showDashboardForm,
}

export default CreatorLocks

const Locks = styled.section`
  display: grid;
  grid-gap: 32px;
`

const LockHeaderRow = styled.div`
  font-family: 'IBM Plex Mono', 'Courier New', Serif;
  font-weight: 200;
  padding-left: 8px;
  font-size: 14px;
  display: grid;
  grid-gap: 16px;
  ${LockRowGrid}
  align-items: center;
`

const LockHeader = styled.div`
  font-family: 'IBM Plex Sans';
  font-size: 13px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: normal;
  color: var(--grey);
`

const LockMinorHeader = styled.div`
  font-family: 'IBM Plex Mono';
  font-size: 8px;
  font-weight: thin;
  font-style: normal;
  font-stretch: normal;
  line-height: normal;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--darkgrey);
`

export const ActionButton = styled.button`
  background-color: ${props => props.disabled ? 'var(--grey)' : 'var(--green)'};
  border: none;
  font-size: 16px;
  color: var(--darkgrey);
  font-family: "IBM Plex Sans", sans-serif;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'auto' : 'pointer'};
`

const CreateButton = styled(ActionButton)`
  padding: 10px;
  align-self: end;
`
