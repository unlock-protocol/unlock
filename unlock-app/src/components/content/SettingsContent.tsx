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
import Authenticate from '../interface/Authenticate'
import { useCards } from '../../hooks/useCards'
import { Account } from '../../unlockTypes'
import Loading from '../interface/Loading'

interface PaymentSettings {
  address: string
}

export const PaymentSettings = ({ address }: PaymentSettings) => {
  const { cards, loading, saveCard, deleteCard } = useCards(address)
  if (loading) {
    return <Loading />
  }
  if (cards.length > 0) {
    return <PaymentMethods cards={cards} deleteCard={deleteCard} />
  }
  return <PaymentDetails saveCard={(token: string) => saveCard(token)} />
}

interface SettingsContentProps {
  account: Account | undefined
}

export const SettingsContent = ({ account }: SettingsContentProps) => {
  return (
    <Layout title="Account Settings">
      <Head>
        <title>{pageTitle('Account Settings')}</title>
      </Head>
      <Authenticate unlockUserAccount>
        <Errors />
        {account && account.emailAddress && <AccountInfo />}
        {account && <PaymentSettings address={account.address} />}
        {account && account.emailAddress && <EjectAccount />}
      </Authenticate>
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
