import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import { Card } from '@stripe/stripe-js'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import Errors from '../interface/Errors'
import AccountInfo from '../interface/user-account/AccountInfo'
import { PaymentDetails } from '../interface/user-account/PaymentDetails'
import PaymentMethods from '../interface/user-account/PaymentMethods'
import EjectAccount from '../interface/user-account/EjectAccount'
import LogInSignUp from '../interface/LogInSignUp'

interface SettingsContentProps {
  account: {
    emailAddress?: string
  } | null
  cards: Card[]
}

export const SettingsContent = ({ cards, account }: SettingsContentProps) => {
  return (
    <Layout title="Account Settings">
      <Head>
        <title>{pageTitle('Account Settings')}</title>
      </Head>
      <Errors />
      {account && account.emailAddress && (
        <>
          <AccountInfo />
          {cards.length > 0 && <PaymentMethods cards={cards} />}
          {cards.length === 0 && <PaymentDetails />}
          <EjectAccount />
        </>
      )}
      {!account && <LogInSignUp login />}
      {account && !account.emailAddress && (
        <p>
          This page contains settings for managed account users. Crypto users
          (like you!) don&apos;t need it.
        </p>
      )}
    </Layout>
  )
}

interface ReduxState {
  account: {
    cards?: Card[]
    emailAddress?: string
  } | null
}

export const mapStateToProps = ({ account }: ReduxState) => {
  let cards: Card[] = []
  if (account && account.cards) {
    cards = account.cards
  }

  return {
    account,
    cards,
  }
}

export default connect(mapStateToProps)(SettingsContent)
