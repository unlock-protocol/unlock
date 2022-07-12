import styled from 'styled-components'
import React, { useContext, useState } from 'react'

import Head from 'next/head'
import PropTypes from 'prop-types'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'
import UnlockPropTypes from '../../propTypes'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import CreatorLocks from '../creator/CreatorLocks'
import BrowserOnly from '../helpers/BrowserOnly'
import { pageTitle } from '../../constants'
import LoginPrompt from '../interface/LoginPrompt'

import {
  CreateLockButton,
  CancelCreateLockButton,
  AccountWrapper,
} from '../interface/buttons/ActionButton'
import { Phone } from '../../theme/media'

const ButtonToCreateLock = ({ formIsVisible, toggleForm }) => {
  const { account } = useContext(AuthenticationContext)

  return (
    <>
      {formIsVisible && (
        <CancelCreateLockButton id="CreateLockButton" onClick={toggleForm}>
          Cancel Lock
        </CancelCreateLockButton>
      )}
      {!formIsVisible && (
        <CreateLockButton
          disabled={!account}
          id="CreateLockButton"
          onClick={toggleForm}
        >
          Create Lock
        </CreateLockButton>
      )}
    </>
  )
}

ButtonToCreateLock.propTypes = {
  formIsVisible: PropTypes.bool,
  toggleForm: PropTypes.func.isRequired,
}

ButtonToCreateLock.defaultProps = {
  formIsVisible: false,
}

export const DashboardContent = () => {
  const { account, network } = useContext(AuthenticationContext)

  const [formIsVisible, setFormIsVisible] = useState(false)
  const toggleForm = () => {
    formIsVisible ? setFormIsVisible(false) : setFormIsVisible(true)
  }
  const hideForm = () => {
    setFormIsVisible(false)
  }

  return (
    <Layout title="Creator Dashboard">
      <Head>
        <title>{pageTitle('Dashboard')}</title>
      </Head>
      {!account && (
        <LoginPrompt>
          In order to deploy locks, we require the use of your own Ethereum
          wallet.{' '}
          <a
            target="_blank"
            rel="noreferrer"
            href="https://ethereum.org/en/wallets/"
          >
            Learn more about wallets
          </a>
        </LoginPrompt>
      )}
      {account && (
        <BrowserOnly>
          <AccountWrapper>
            <Account />
            <ButtonToCreateLock
              toggleForm={toggleForm}
              formIsVisible={formIsVisible}
            />
          </AccountWrapper>
          <Phone>
            <Warning>
              The Dashboard is currently not optimized for a mobile experience.
              To create locks, please use a desktop computer.
            </Warning>
          </Phone>

          {network === 1 && (
            <Warning>
              Gas prices are high on Ethereum&apos;s main network. Consider
              deploying your lock to any of{' '}
              <a
                target="_blank"
                href="https://docs.unlock-protocol.com/core-protocol/unlock/networks"
                rel="noreferrer"
              >
                Unlock&apos;s supported networks
              </a>
              , such as xDAI or Polygon.
            </Warning>
          )}

          <CreatorLocks hideForm={hideForm} formIsVisible={formIsVisible} />
        </BrowserOnly>
      )}
    </Layout>
  )
}

export default DashboardContent

const Warning = styled.p`
  border: 1px solid var(--red);
  border-radius: 4px;
  padding: 10px;
  color: var(--red);
`
