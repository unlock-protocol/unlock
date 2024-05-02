import fetch from 'isomorphic-fetch'
import {
  ApolloClient,
  InMemoryCache,
  gql,
  DefaultOptions,
} from '@apollo/client'
import { HttpLink } from 'apollo-link-http'
import { genKeyId } from './keys'

import { localhost } from '@unlock-protocol/networks'

const {
  subgraph: { endpoint: subgraphURI },
} = localhost

const link = new HttpLink({
  uri: subgraphURI,
  fetch,
})

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
}

export const subgraph = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  defaultOptions,
})

const getLockQuery = gql`
  query Lock($id: Bytes!) {
    lock(id: $id) {
      id
      tokenAddress
      address
      version
      price
      lockManagers
      expirationDuration
      name
      symbol
      totalKeys
      createdAtBlock
      maxNumberOfKeys
      maxKeysPerAddress
    }
  }
`
export const getLock = async (lockAddress: string) => {
  const {
    data: { lock },
  } = await subgraph.query({
    query: getLockQuery,
    variables: {
      id: lockAddress.toLowerCase(),
    },
  })
  return lock
}

const getKeyQuery = gql`
  query Key($id: Bytes!) {
    key(id: $id) {
      lock
      tokenId
      owner
      manager
      expiration
      tokenURI
      cancelled
      createdAtBlock
    }
  }
`
export const getKey = async (lockAddress: string, tokenId: bigint) => {
  const keyId = genKeyId(lockAddress.toLowerCase(), tokenId)
  const {
    data: { key },
  } = await subgraph.query({
    query: getKeyQuery,
    variables: {
      id: keyId,
    },
  })
  return key
}

const getReceiptQuery = gql`
  query Receipt($id: Bytes!) {
    receipt(id: $id) {
      id
      timestamp
      sender
      payer
      lockAddress
      tokenAddress
      amountTransferred
      gasTotal
    }
  }
`
export const getReceipt = async (txHash: string) => {
  const {
    data: { receipt },
  } = await subgraph.query({
    query: getReceiptQuery,
    variables: {
      id: txHash.toLowerCase(),
    },
  })
  return receipt
}

export const getLocks = async (first = 100, isErc20 = false) => {
  const getLocksQuery = gql`query Locks($first: Int = 1) {
    locks(first: $first, where: {${
      isErc20 ? `tokenAddress_not_contains` : `tokenAddress_contains`
    }: "0000000000000000000000000000000000000000" }) {
      tokenAddress
      address
    }
  }
`
  const { data } = await subgraph.query({
    query: getLocksQuery,
    variables: {
      first: first,
    },
  })
  return data.locks
}
