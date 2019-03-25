import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import UnlockPropTypes from '../../propTypes'
import CreatorLock from './CreatorLock'
import { LockRowGrid, PhoneLockRowGrid } from './LockStyles'
import CreatorLockForm from './CreatorLockForm'
import Errors from '../interface/Errors'
import Media, { NoPhone, Phone } from '../../theme/media'
import { createLock } from '../../actions/lock'
import { DefaultError } from './FatalError'
import Svg from '../interface/svg'

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
    const { createLock, lockFeed, loading } = this.props
    const { showDashboardForm } = this.state

    return (
      <Locks>
        <LockHeaderRow id="LockHeaderRow">
          <LockHeader>Locks</LockHeader>
          <LockMinorHeader>Name / Address</LockMinorHeader>
          <LockMinorHeader>Key Duration</LockMinorHeader>
          <Quantity>Key Quantity</Quantity>
          <LockMinorHeader>Price</LockMinorHeader>
          <LockMinorHeader>
            <NoPhone>Balance</NoPhone>
            <Phone>Balance</Phone>
          </LockMinorHeader>
          <CreateButton onClick={this.toggleForm} id="CreateLockButton">
            Create Lock
          </CreateButton>
        </LockHeaderRow>
        <Errors />
        {showDashboardForm && (
          <CreatorLockForm
            hideAction={this.toggleForm}
            createLock={createLock}
            pending
          />
        )}
        {lockFeed.length > 0 &&
          lockFeed.map(lock => {
            return <CreatorLock key={JSON.stringify(lock)} lock={lock} />
          })}
        {lockFeed.length === 0 && !loading && !showDashboardForm && (
          <DefaultError
            title="Create a lock to get started"
            illustration="/static/images/illustrations/lock.svg"
            critical={false}
          >
            You have not created any locks yet. Create your first lock in
            seconds by clicking on the &#8216;Create Lock&#8217; button.
          </DefaultError>
        )}
        {loading && (
          <LoadingWrapper>
            <Svg.Loading title="loading" />
          </LoadingWrapper>
        )}
      </Locks>
    )
  }
}

CreatorLocks.propTypes = {
  createLock: PropTypes.func.isRequired,
  showForm: UnlockPropTypes.showDashboardForm,
  lockFeed: PropTypes.arrayOf(UnlockPropTypes.lock),
  loading: PropTypes.bool,
}

CreatorLocks.defaultProps = {
  loading: false,
  showForm: false,
  lockFeed: [],
}

const mapDispatchToProps = dispatch => ({
  createLock: lock => dispatch(createLock(lock)),
})

export const mapStateToProps = ({ loading }) => {
  return {
    loading: !!loading,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreatorLocks)

const LoadingWrapper = styled.section`
  display: grid;
  justify-items: center;
  svg {
    fill: var(--lightgrey);
    width: 60px;
  }
`

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

export const Quantity = styled(LockMinorHeader)`
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
  outline: none;
  transition: background-color 200ms ease;
  & :hover {
    background-color: var(--activegreen);
  }
`

const CreateButton = styled(ActionButton)`
  padding: 10px;
  align-self: end;
  ${Media.phone`
    display: none;
  `};
`
