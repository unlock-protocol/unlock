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
import { expirationAsDate } from '../../utils/durations'

interface KeyMetadata {
  // These 3 properties are always present -- they come down from the graph as
  // strings
  lockName: string
  expiration: string
  keyholderAddress: string
  // Can have any other arbitrary properies, as long as the values are strings.
  [key: string]: string
}

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
    <Layout title="Members">
      <Head>
        <title>{pageTitle('Members')}</title>
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
  let metadata: KeyMetadata[] = []
  // TODO: types for all graph data -- grouped by query?
  data.locks.forEach((lock: any) => {
    lock.keys.forEach((key: any) => {
      metadata.push({
        lockName: lock.name,
        expiration: expirationAsDate(parseInt(key.expiration)),
        keyholderAddress: key.owner.address,
      })
    })
  })

  // TODO: get additional metadata from locksmith if it exists, for each key.
  // We'll have to delay rendering until we retrieve all of it so the table
  // doesn't jump.

  return <MetadataTable columns={columns} metadata={metadata} />
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
    // search.locks will be either a string or an array.
    // when there is only one value, it's a string. For any more, it's an array.
    if (typeof search.locks === 'string') {
      lockAddresses.push(search.locks)
    } else {
      lockAddresses = search.locks as any
    }
  }
  return {
    account,
    network,
    lockAddresses,
  }
}

export default connect(mapStateToProps)(KeyMetadataContent)
