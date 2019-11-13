import React, { useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import 'cross-fetch/polyfill'
import { connect } from 'react-redux'
import Head from 'next/head'
import queryString from 'query-string'
import BrowserOnly from '../helpers/BrowserOnly'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import { pageTitle } from '../../constants'
import {
  Account as AccountType,
  Network,
  Router,
  ReduxMetadata,
  KeyholdersByLock,
} from '../../unlockTypes'
import { MetadataTable } from '../interface/MetadataTable'
import keyHolderQuery from '../../queries/keyholdersByLock'
import { signMetadataRequest } from '../../actions/keyMetadata'
import {
  mergeKeyholderMetadata,
  generateColumns,
} from '../../utils/metadataMunging'

interface Props {
  account: AccountType
  network: Network
  lockAddresses: string[]
  signMetadataRequest: typeof signMetadataRequest
  metadata: ReduxMetadata
}

export const MembersContent = ({
  account,
  network,
  lockAddresses,
  signMetadataRequest,
  metadata,
}: Props) => {
  return (
    <Layout title="Members">
      <Head>
        <title>{pageTitle('Members')}</title>
      </Head>
      {account && (
        <BrowserOnly>
          <Account network={network} account={account} />
          <MetadataTableWrapper
            lockAddresses={lockAddresses}
            signMetadataRequest={signMetadataRequest}
            accountAddress={account.address}
            storedMetadata={metadata}
          />
        </BrowserOnly>
      )}
    </Layout>
  )
}

interface MetadataTableWrapperProps {
  lockAddresses: string[]
  signMetadataRequest: typeof signMetadataRequest
  accountAddress: string
  storedMetadata: ReduxMetadata
}
/**
 * This just wraps the metadataTable component, providing the data
 * from the graph so we can separate the data layer from the
 * presentation layer.
 */
const MetadataTableWrapper = ({
  lockAddresses,
  signMetadataRequest,
  accountAddress,
  storedMetadata,
}: MetadataTableWrapperProps) => {
  const { loading, error, data } = useQuery(keyHolderQuery(), {
    variables: { addresses: lockAddresses },
  })

  useEffect(() => {
    // Dispatch request for key metadata here, only when data changes
    if (data) {
      ;(data as KeyholdersByLock).locks.forEach(lock => {
        const keyIds = lock.keys.map(key => key.keyId)
        signMetadataRequest(lock.address, accountAddress, keyIds)
      })
    }
  }, [data])

  if (loading) {
    return <span>Loading...</span>
  }

  if (error) {
    return <span>An error occurred.</span>
  }

  const metadata = mergeKeyholderMetadata(data, storedMetadata)
  const columns = generateColumns(metadata)

  return <MetadataTable columns={columns} metadata={metadata} />
}

interface ReduxState {
  account: AccountType
  network: Network
  router: Router
  metadata: ReduxMetadata
}

export const mapStateToProps = ({
  account,
  network,
  router,
  metadata,
}: ReduxState) => {
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
    metadata,
  }
}

export default connect(mapStateToProps, { signMetadataRequest })(MembersContent)
