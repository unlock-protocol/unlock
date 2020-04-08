import styled from 'styled-components'
import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import PropTypes from 'prop-types'
import UnlockPropTypes from '../../propTypes'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import CreatorLocks from '../creator/CreatorLocks'
import BrowserOnly from '../helpers/BrowserOnly'
import { pageTitle } from '../../constants'
import {
  CreateLockButton,
  CancelCreateLockButton,
  AccountWrapper,
} from '../interface/buttons/ActionButton'
import { showForm, hideForm } from '../../actions/lockFormVisibility'
import { Phone } from '../../theme/media'

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
    <Layout title="Creator Dashboard">
      <Head>
        <title>{pageTitle('Dashboard')}</title>
      </Head>
      {account && (
        <BrowserOnly>
          <AccountWrapper>
            <Account network={network} account={account} />
            {formIsVisible && (
              <CancelCreateLockButton
                id="CreateLockButton"
                onClick={toggleForm}
              >
                Cancel Lock
              </CancelCreateLockButton>
            )}
            {!formIsVisible && (
              <CreateLockButton id="CreateLockButton" onClick={toggleForm}>
                Create Lock
              </CreateLockButton>
            )}
          </AccountWrapper>
          <Phone>
            <Warning>
              The Dashboard is currently not optimized for a mobile experience.
              To create locks, please use a desktop computer.
            </Warning>
          </Phone>

          <CreatorLocks />
        </BrowserOnly>
      )}
    </Layout>
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
    account,
    network,
    formIsVisible: visible,
  }
}

const mapDispatchToProps = dispatch => ({
  showForm: () => dispatch(showForm()),
  hideForm: () => dispatch(hideForm()),
})

export default connect(mapStateToProps, mapDispatchToProps)(DashboardContent)

const Warning = styled.p`
  border: 1px solid var(--red);
  border-radius: 4px;
  padding: 10px;
  color: var(--red);
`
