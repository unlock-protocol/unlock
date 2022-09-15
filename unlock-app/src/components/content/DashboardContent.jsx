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
} from '../interface/buttons/ActionButton'
import { Phone } from '../../theme/media'
import { Button } from '@unlock-protocol/ui'

const ButtonToCreateLock = ({ formIsVisible, toggleForm }) => {
  const { account } = useContext(AuthenticationContext)

  return (
    <>
      {formIsVisible && (
        <Button
          variant="outlined-primary"
          id="CreateLockButton"
          onClick={toggleForm}
        >
          Cancel Lock
        </Button>
      )}
      {!formIsVisible && (
        <Button disabled={!account} id="CreateLockButton" onClick={toggleForm}>
          Create Lock
        </Button>
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
          <div className="flex flex-col gap-3 md:items-center md:flex-row">
            <Account />
            <div className="md:ml-auto">
              <ButtonToCreateLock
                toggleForm={toggleForm}
                formIsVisible={formIsVisible}
              />
            </div>
          </div>
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

          {network === 4 && (
            <Warning>
              The Rinkeby test network has been deprecated and Unlock will
              remove its support on December 31st 2022. Consider{' '}
              <a href="https://unlock-protocol.com/blog/goerli">using Goerli</a>
              !
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
