import styled from 'styled-components'
import React, { useState } from 'react'
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
import { Phone } from '../../theme/media'
import Authenticate from '../interface/Authenticate'

export const DashboardContent = () => {
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
      <Authenticate>
        <BrowserOnly>
          <AccountWrapper>
            <Account />
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

          <CreatorLocks hideForm={hideForm} formIsVisible={formIsVisible} />
        </BrowserOnly>
      </Authenticate>
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
