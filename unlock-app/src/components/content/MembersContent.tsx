import styled from 'styled-components'
import React, { useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'
import 'cross-fetch/polyfill'
import { connect } from 'react-redux'
import Head from 'next/head'
import queryString from 'query-string'
import Link from 'next/link'
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
import { signBulkMetadataRequest } from '../../actions/keyMetadata'
import {
  mergeKeyholderMetadata,
  generateColumns,
} from '../../utils/metadataMunging'
import Loading from '../interface/Loading'

interface Props {
  account: AccountType
  network: Network
  lockAddresses: string[]
  signBulkMetadataRequest: typeof signBulkMetadataRequest
  metadata: ReduxMetadata
}

export const MembersContent = ({
  account,
  network,
  lockAddresses,
  signBulkMetadataRequest,
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
            signBulkMetadataRequest={signBulkMetadataRequest}
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
  signBulkMetadataRequest: typeof signBulkMetadataRequest
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
  signBulkMetadataRequest,
  accountAddress,
  storedMetadata,
}: MetadataTableWrapperProps) => {
  if (!lockAddresses.length) {
    return <Loading />
  }
  // TODO: Refactor using a single hook to
  // 1. retrieve the keys from the graph
  // 2. ask the user to sign
  // 3. retrieve the metadata
  const { loading, error, data } = useQuery(keyHolderQuery(), {
    variables: { addresses: lockAddresses },
  })

  useEffect(() => {
    // Dispatch requests for key metadata here, only when data changes
    if (data) {
      ;(data as KeyholdersByLock).locks.forEach(lock => {
        signBulkMetadataRequest(lock.address, accountAddress)
      })
    }
  }, [data])

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <Message>
        An error occurred. Return to your{' '}
        <Link href="/dashboard">
          <a>Dashboard</a>
        </Link>
      </Message>
    )
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

const Message = styled.p`
  color: var(--grey);
`

export default connect(mapStateToProps, { signBulkMetadataRequest })(
  MembersContent
)
