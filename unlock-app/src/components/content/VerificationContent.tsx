import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import queryString from 'query-string'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import VerificationStatus from '../interface/VerificationStatus'
import { pageTitle } from '../../constants'
import { Account as AccountType, Network, Router } from '../../unlockTypes'

interface VerificationData {
  accountAddress: string
  lockAddress: string
  timestamp: number
}

interface VerificationContentProps {
  account: AccountType
  network: Network
  data?: VerificationData
  hexData?: string
  sig?: string
}

export const VerificationContent = ({
  account,
  network,
  data,
  sig,
  hexData,
}: VerificationContentProps) => {
  return (
    <Layout title="Verification">
      <Head>
        <title>{pageTitle('Verification')}</title>
      </Head>
      {account && <Account network={network} account={account} />}
      <VerificationStatus data={data} sig={sig} hexData={hexData} />
    </Layout>
  )
}

interface ReduxState {
  account: AccountType
  network: Network
  router: Router
}

export const mapStateToProps = ({
  account,
  network,
  router,
}: ReduxState): VerificationContentProps => {
  let data
  let hexData
  let sig
  const search = queryString.parse(router.location.search)

  if (typeof search.data === 'string' && typeof search.sig === 'string') {
    data = JSON.parse(decodeURIComponent(search.data))
    hexData =
      '0x' +
      Buffer.from(decodeURIComponent(search.data), 'utf-8').toString('hex')
    sig = Buffer.from(search.sig, 'base64').toString()
  }

  return {
    account,
    network,
    data,
    hexData,
    sig,
  }
}

export default connect(mapStateToProps)(VerificationContent)
