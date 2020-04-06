import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import Errors from '../interface/Errors'
import AccountInfo from '../interface/user-account/AccountInfo'
import { PaymentDetails } from '../interface/user-account/PaymentDetails'
import PaymentMethods from '../interface/user-account/PaymentMethods'
import EjectAccount from '../interface/user-account/EjectAccount'
import LogInSignUp from '../interface/LogInSignUp'
import { useCards } from '../../hooks/useCards'
import { Account } from '../../unlockTypes'
import Loading from '../interface/Loading'

interface SettingsContentProps {
  account: Account | undefined
}

export const SettingsContent = ({ account }: SettingsContentProps) => {
  const { cards } = useCards(account)

  return (
    <Layout title="Account Settings">
      <Head>
        <title>{pageTitle('Account Settings')}</title>
      </Head>
      <Errors />
      {account && account.emailAddress && (
        <>
          <AccountInfo />
          {!cards && <Loading />}
          {cards && cards.length > 0 && <PaymentMethods cards={cards} />}
          {cards && cards.length === 0 && <PaymentDetails />}
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
  account: Account | null
}

export const mapStateToProps = ({ account }: ReduxState) => {
  return {
    account: account || undefined,
  }
}

export default connect(mapStateToProps)(SettingsContent)
