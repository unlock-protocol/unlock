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

export const DashboardContent = ({
  account,
  network,
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
            <CreatorLocks />
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
  formIsVisible: PropTypes.bool.isRequired,
  showForm: PropTypes.func.isRequired,
  hideForm: PropTypes.func.isRequired,
}

DashboardContent.defaultProps = {
  account: null,
}

export const mapStateToProps = ({
  account,
  network,
  lockFormStatus: { visible },
}) => {
  return {
    account: account,
    network: network,
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
