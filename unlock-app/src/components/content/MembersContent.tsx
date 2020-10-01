import styled from 'styled-components'
import React, { useState } from 'react'
import 'cross-fetch/polyfill'
import { connect } from 'react-redux'
import Head from 'next/head'
import queryString from 'query-string'
import Link from 'next/link'
import Authenticate from '../interface/Authenticate'
import BrowserOnly from '../helpers/BrowserOnly'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import { pageTitle } from '../../constants'
import {
  Account as AccountType,
  Network,
  Router,
  MemberFilters,
} from '../../unlockTypes'
import { MetadataTable } from '../interface/MetadataTable'
import Loading from '../interface/Loading'
import useMembers from '../../hooks/useMembers'

interface FilterProps {
  value: string
  current: string
  setFilter: (filter: string) => any
}

const Filter = ({ value, current, setFilter }: FilterProps) => {
  return (
    <StyledFilter active={current === value} onClick={() => setFilter(value)}>
      {value}
    </StyledFilter>
  )
}

interface PaginationProps {
  currentPage: number
  hasNextPage: boolean
  setCurrentPage: (page: number) => any
}

const Pagination = ({
  currentPage,
  setCurrentPage,
  hasNextPage,
}: PaginationProps) => {
  if (currentPage === 0 && !hasNextPage) {
    return null
  }
  const previousPageButton = (
    <StyledFilter
      active={currentPage === 0}
      onClick={() => setCurrentPage(currentPage - 1)}
    >
      Previous
    </StyledFilter>
  )
  const nextPageButton = (
    <StyledFilter
      active={!hasNextPage}
      onClick={() => setCurrentPage(currentPage + 1)}
    >
      Next
    </StyledFilter>
  )
  return (
    <Filters>
      Page: {currentPage} {previousPageButton} {nextPageButton}
    </Filters>
  )
}

interface Props {
  account: AccountType
  network: Network
  lockAddresses: string[]
  page: number
}

export const MembersContent = ({
  account,
  network,
  lockAddresses,
  page,
}: Props) => {
  const [filter, setFilter] = useState(MemberFilters.ACTIVE)

  return (
    <Layout title="Members">
      <Head>
        <title>{pageTitle('Members')}</title>
      </Head>
      <Authenticate>
        {account && (
          <BrowserOnly>
            <Account network={network} account={account} />
            <Filters>
              Show{' '}
              <Filter
                value={MemberFilters.ACTIVE}
                current={filter}
                setFilter={(value) => setFilter(value)}
              />
              <Filter
                value={MemberFilters.ALL}
                current={filter}
                setFilter={(value) => setFilter(value)}
              />
            </Filters>
            <MetadataTableWrapper
              page={page}
              lockAddresses={lockAddresses}
              accountAddress={account.address}
              filter={filter}
            />
          </BrowserOnly>
        )}
      </Authenticate>
    </Layout>
  )
}

interface MetadataTableWrapperProps {
  lockAddresses: string[]
  accountAddress: string
  filter: string
  page: number
}
/**
 * This just wraps the metadataTable component, providing the data
 * from the graph so we can separate the data layer from the
 * presentation layer.
 */
const MetadataTableWrapper = ({
  lockAddresses,
  accountAddress,
  filter,
  page,
}: MetadataTableWrapperProps) => {
  const [currentPage, setCurrentPage] = useState(page)
  const { loading, error, list, columns, hasNextPage } = useMembers(
    lockAddresses,
    accountAddress,
    filter,
    currentPage
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
  return (
    <>
      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        hasNextPage={hasNextPage}
      />
      <MetadataTable columns={columns} metadata={list} />
    </>
  )
}

MetadataTableWrapper.defaultProps = {}

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
  let page = 0
  if (search.page && typeof search.page === 'string') {
    page = parseInt(search.page)
  }
  return {
    page,
    account,
    network,
    lockAddresses,
  }
}

const Message = styled.p`
  color: var(--grey);
`

export const Filters = styled.nav`
  color: var(--grey);
  font-size: 13px;
`

interface StyledFilterProps {
  active?: boolean
}
const StyledFilter = styled.li`
  cursor: ${(props: StyledFilterProps) =>
    props.active ? 'not-allowed' : 'pointer'};
  display: inline-block;
  margin: 5px;
  color: ${(props) => (props.active ? 'var(--darkgrey)' : 'var(--blue)')};
  font-weight: ${(props) => (props.active ? '700' : '300')};
`

export default connect(mapStateToProps)(MembersContent)
