import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import PropTypes from 'prop-types'
import UnlockPropTypes from '../../propTypes'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import CreatorLocks from '../creator/CreatorLocks'
import DeveloperOverlay from '../developer/DeveloperOverlay'
import BrowserOnly from '../helpers/BrowserOnly'
import GlobalErrorConsumer from '../interface/GlobalErrorConsumer'
import { pageTitle } from '../../constants'
import {
  CreateLockButton,
  AccountWrapper,
} from '../interface/buttons/ActionButton'
import { showForm, hideForm } from '../../actions/lockFormVisibility'

// TODO : move lockFeed extraction in CreatorLocks since it's just being passed down there
export const DashboardContent = ({
  account,
  network,
  lockFeed,
  formIsVisible,
  showForm,
  hideForm,
}) => {
  const toggleForm = () => {
    formIsVisible ? hideForm() : showForm()
  }
  return (
    <GlobalErrorConsumer>
      <Layout title="Creator Dashboard">
        <Head>
          <title>{pageTitle('Dashboard')}</title>
        </Head>
        {account && (
          <BrowserOnly>
            <AccountWrapper>
              <Account network={network} account={account} />
              <CreateLockButton id="CreateLockButton" onClick={toggleForm}>
                Create Lock
              </CreateLockButton>
            </AccountWrapper>
            <CreatorLocks lockFeed={lockFeed} />
            <DeveloperOverlay />
          </BrowserOnly>
        )}
      </Layout>
    </GlobalErrorConsumer>
  )
}

DashboardContent.propTypes = {
  account: UnlockPropTypes.account,
  network: UnlockPropTypes.network.isRequired,
  lockFeed: PropTypes.arrayOf(UnlockPropTypes.lock),
  formIsVisible: PropTypes.bool.isRequired,
  showForm: PropTypes.func.isRequired,
  hideForm: PropTypes.func.isRequired,
}

DashboardContent.defaultProps = {
  lockFeed: [],
  account: null,
}

export const mapStateToProps = ({
  transactions,
  locks,
  account,
  network,
  lockFormStatus: { visible },
}) => {
  // We want to display newer locks first, so sort the locks by blockNumber in descending order
  const locksComparator = (a, b) => {
    // Newly created locks may not have a transaction associated just yet
    // -- those always go right to the top
    if (!transactions[a.transaction]) {
      return -1
    }
    if (!transactions[b.transaction]) {
      return 1
    }
    return (
      transactions[b.transaction].blockNumber -
      transactions[a.transaction].blockNumber
    )
  }

  // Only show the current account's locks
  const locksFilter = lock => {
    return lock.owner === account.address
  }

  const lockFeed = Object.values(locks)
    .filter(locksFilter)
    .sort(locksComparator)

  return {
    account: account,
    network: network,
    lockFeed,
    formIsVisible: visible,
  }
}

const mapDispatchToProps = dispatch => ({
  showForm: () => dispatch(showForm()),
  hideForm: () => dispatch(hideForm()),
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardContent)
