import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import Layout from '../interface/Layout'
import AccountInfo from '../interface/Account'
import CreatorLocks from '../creator/CreatorLocks'
import DeveloperOverlay from '../developer/DeveloperOverlay'
import BrowserOnly from '../helpers/BrowserOnly'
import GlobalErrorConsumer from '../interface/GlobalErrorConsumer'
import { pageTitle } from '../../constants'
import { Account, Network, Locks, Lock, Transactions } from '../../unlock'
import { CreateLockButton, AccountWrapper } from '../interface/buttons/ActionButton'
import { showForm, hideForm } from '../../actions/lockFormVisibility';

interface Props {
  account: Account
  network: Network
  lockFeed: Lock[]
  formIsVisible: boolean
  showForm: () => any
  hideForm: () => any
}

// TODO : move lockFeed extraction in CreatorLocks since it's just being passed down there
export const DashboardContent = ({
  account,
  network,
  lockFeed,
  formIsVisible,
  showForm,
  hideForm,
}: Props) => {

  const handleClick = () => {
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
              <AccountInfo network={network} account={account} />
              <CreateLockButton id="CreateLockButton" onClick={handleClick}>
                Create Lock
              </CreateLockButton>
            </AccountWrapper>
            <CreatorLocks
              lockFeed={lockFeed}
              hideForm={hideForm}
              formIsVisible={formIsVisible}
            />
            <DeveloperOverlay />
          </BrowserOnly>
        )}
      </Layout>
    </GlobalErrorConsumer>
  )
}

interface State {
  transactions: Transactions
  locks: Locks
  account: Account
  network: Network
  lockFormStatus: { visible: boolean }
}

export const mapStateToProps = ({
  transactions,
  locks,
  account,
  network,
  lockFormStatus: { visible },
}: State) => {
  // We want to display newer locks first, so sort the locks by blockNumber in descending order
  const locksComparator = (a: Lock, b: Lock) => {
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
  const lockFeed = Object.values(locks).sort(locksComparator)
  return {
    account,
    network,
    lockFeed,
    formIsVisible: visible,
  }
}

const mapDispatchToProps = (dispatch: any) => ({
  showForm: dispatch(showForm),
  hideForm: dispatch(hideForm),
})

export default connect(mapStateToProps, mapDispatchToProps)(DashboardContent)
