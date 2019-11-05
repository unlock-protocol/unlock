import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import 'cross-fetch/polyfill'
import { connect } from 'react-redux'
import Head from 'next/head'
import queryString from 'query-string'
import BrowserOnly from '../helpers/BrowserOnly'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import { pageTitle } from '../../constants'
import { Account as AccountType, Network, Router } from '../../unlockTypes'
import { MetadataTable } from '../interface/MetadataTable'
import keyHolderQuery from '../../queries/keyholdersByLock'

interface Props {
  account: AccountType
  network: Network
  lockAddresses: string[]
}

export const KeyMetadataContent = ({
  account,
  network,
  lockAddresses,
}: Props) => {
  return (
    <Layout title="Key Chain">
      <Head>
        <title>{pageTitle('Key Chain')}</title>
      </Head>
      {account && (
        <BrowserOnly>
          <Account network={network} account={account} />
          <GraphWrapper lockAddresses={lockAddresses} />
        </BrowserOnly>
      )}
    </Layout>
  )
}

const GraphWrapper = ({ lockAddresses }: { lockAddresses: string[] }) => {
  const { loading, error, data } = useQuery(keyHolderQuery(), {
    variables: { addresses: lockAddresses },
  })

  if (loading) {
    return <span>Loading...</span>
  }

  if (error) {
    return <span>An error occurred.</span>
  }

  const columns = ['lockName', 'keyholderAddress', 'expiration']

  return <MetadataTable columns={columns} metadata={data} />
}

interface ReduxState {
  account: AccountType
  network: Network
  router: Router
}

export const mapStateToProps = ({ account, network, router }: ReduxState) => {
  // URL formatted like: ?locks=address1,address2,address3
  const search = queryString.parse(router.location.search, {
    arrayFormat: 'comma',
  })
  let lockAddresses: string[] = []
  if (search.locks) {
    lockAddresses = search.locks as any
  }
  return {
    account,
    network,
    lockAddresses,
  }
}

export default connect(mapStateToProps)(KeyMetadataContent)
