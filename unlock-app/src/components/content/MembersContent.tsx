import styled from 'styled-components'
import React from 'react'
import 'cross-fetch/polyfill'
import { connect } from 'react-redux'
import Head from 'next/head'
import queryString from 'query-string'
import Link from 'next/link'
import BrowserOnly from '../helpers/BrowserOnly'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import { pageTitle } from '../../constants'
import { Account as AccountType, Network, Router } from '../../unlockTypes'
import { MetadataTable } from '../interface/MetadataTable'
import Loading from '../interface/Loading'
import useMembers from '../../hooks/useMembers'

interface Props {
  account: AccountType
  network: Network
  lockAddresses: string[]
}

export const MembersContent = ({ account, network, lockAddresses }: Props) => {
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
            accountAddress={account.address}
          />
        </BrowserOnly>
      )}
    </Layout>
  )
}

interface MetadataTableWrapperProps {
  lockAddresses: string[]
  accountAddress: string
}
/**
 * This just wraps the metadataTable component, providing the data
 * from the graph so we can separate the data layer from the
 * presentation layer.
 */
const MetadataTableWrapper = ({
  lockAddresses,
  accountAddress,
}: MetadataTableWrapperProps) => {
  const { loading, error, list, columns } = useMembers(
    lockAddresses,
    accountAddress
  )

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

  // TODO: rename metadata into members inside of MetadataTable
  return <MetadataTable columns={columns} metadata={list} />
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

const Message = styled.p`
  color: var(--grey);
`

export default connect(mapStateToProps)(MembersContent)
