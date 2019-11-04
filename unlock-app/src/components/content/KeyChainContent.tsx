import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import BrowserOnly from '../helpers/BrowserOnly'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import { pageTitle } from '../../constants'
import LogInSignUp from '../interface/LogInSignUp'
import { Account as AccountType, Network } from '../../unlockTypes'
import { signData } from '../../actions/signature'
import { qrEmail } from '../../actions/user'
import KeyDetails from '../interface/keyChain/KeyDetails'

interface KeyChainContentProps {
  account: AccountType
  network: Network
  signData: (data: any, id: any) => void
  qrEmail: (recipient: string, lockName: string, keyQR: string) => void
  signatures: Signatures
}

interface Signatures {
  [id: string]: {
    data: string
    signature: string
  }
}

export const KeyChainContent = ({
  account,
  network,
  signatures,
  signData,
  qrEmail,
}: KeyChainContentProps) => {
  return (
    <Layout title="Key Chain">
      <Head>
        <title>{pageTitle('Key Chain')}</title>
      </Head>
      {account && (
        <BrowserOnly>
          <Account network={network} account={account} />
          <KeyDetails
            address={account.address.toLowerCase()}
            signData={signData}
            signatures={signatures}
            qrEmail={qrEmail}
          />
        </BrowserOnly>
      )}
      {!account && (
        // Default to log in form. User can toggle to signup.
        <LogInSignUp login />
      )}
    </Layout>
  )
}

interface ReduxState {
  account: AccountType
  network: Network
  signature: Signatures
}

export const mapStateToProps = ({
  account,
  network,
  signature,
}: ReduxState) => {
  return {
    account,
    network,
    signatures: signature,
  }
}

export default connect(
  mapStateToProps,
  { signData, qrEmail }
)(KeyChainContent)
