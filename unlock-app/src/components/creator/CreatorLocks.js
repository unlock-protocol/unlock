import React from 'react'
import styled from 'styled-components'
import UnlockPropTypes from '../../propTypes'
import CreatorLock, { LockRowGrid, PhoneLockRowGrid } from './CreatorLock'
import CreatorLockForm from './CreatorLockForm'
import Error from '../interface/Error'
import Media, { NoPhone, Phone } from '../../theme/Media'

export class CreatorLocks extends React.Component {
  constructor(props, context) {
    super(props, context)
    const { showForm } = this.props
    this.state = {
      showDashboardForm: !!showForm,
    }
    this.toggleForm = this.toggleForm.bind(this)
  }

  toggleForm() {
    this.setState(previousState => ({
      showDashboardForm: !previousState.showDashboardForm,
    }))
  }

  render() {
    const { locks } = this.props
    const { showDashboardForm } = this.state
    let lockFeed = Object.values(locks).reverse() // We want to display newer locks first

    return (
      <Locks>
        <LockHeaderRow>
          <LockHeader>Locks</LockHeader>
          <LockMinorHeader>Name / Address</LockMinorHeader>
          <Duration>Duration</Duration>
          <LockMinorHeader>Quantity</LockMinorHeader>
          <LockMinorHeader>Price</LockMinorHeader>
          <LockMinorHeader>
            <NoPhone>Balance / Earnings</NoPhone>
            <Phone>Balance</Phone>
          </LockMinorHeader>
          <NoPhone>
            <CreateButton onClick={this.toggleForm}>Create Lock</CreateButton>
          </NoPhone>
        </LockHeaderRow>
        <Error />
        {showDashboardForm && <CreatorLockForm hideAction={this.toggleForm} />}
        {lockFeed.map(lock => {
          return <CreatorLock key={JSON.stringify(lock)} lock={lock} />
        })}
      </Locks>
    )
  }
}

CreatorLocks.propTypes = {
  locks: UnlockPropTypes.locks,
  showForm: UnlockPropTypes.showDashboardForm,
}

CreatorLocks.defaultProps = {
  locks: {},
  showForm: false,
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
  ${LockRowGrid} align-items: center;
  ${Media.phone`
    ${PhoneLockRowGrid} align-items: start;
    grid-gap: 4px;
  `};
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
  ${Media.phone`
    grid-row: span 2;
  `};
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

export const Duration = styled(LockMinorHeader)`
  ${Media.phone`
    grid-row: span 2;
  `};
`

export const ActionButton = styled.button`
  background-color: ${props =>
    props.disabled ? 'var(--grey)' : 'var(--green)'};
  border: none;
  font-size: 16px;
  color: var(--darkgrey);
  font-family: 'IBM Plex Sans', sans-serif;
  border-radius: 4px;
  cursor: ${props => (props.disabled ? 'auto' : 'pointer')};
`

const CreateButton = styled(ActionButton)`
  padding: 10px;
  align-self: end;
`
