import React, { useContext, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import AccountInfo from '../interface/user-account/AccountInfo'
import { PaymentDetails } from '../interface/user-account/PaymentDetails'
import PaymentMethods from '../interface/user-account/PaymentMethods'
import EjectAccount from '../interface/user-account/EjectAccount'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'
import { useCards } from '../../hooks/useCards'

import Loading from '../interface/Loading'
import LoginPrompt from '../interface/LoginPrompt'

export const PaymentSettings = () => {
  const { account } = useContext(AuthenticationContext)
  const { cards, loading, saveCard, deleteCard, getCards } = useCards()

  useEffect(() => {
    if (account) {
      getCards(account)
    }
  }, [account])

  if (loading || !account) {
    return <Loading />
  }
  if (cards.length > 0) {
    return (
      <PaymentMethods cards={cards} deleteCard={() => deleteCard(account)} />
    )
  }
  return (
    <PaymentDetails saveCard={(token: string) => saveCard(account, token)} />
  )
}

export const SettingsContent = () => {
  const { account } = useContext(AuthenticationContext)

  return (
    <Layout title="Account Settings">
      <Head>
        <title>{pageTitle('Account Settings')}</title>
      </Head>
      {!account && <LoginPrompt unlockUserAccount />}
      {account && (
        <>
          <AccountInfo />
          <PaymentSettings />
          <EjectAccount />
        </>
      )}
    </Layout>
  )
}

export default SettingsContent
