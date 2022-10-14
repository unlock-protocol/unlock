import fetch from 'isomorphic-fetch'
import {
  ApolloClient,
  InMemoryCache,
  gql,
  DefaultOptions,
} from '@apollo/client'
import { HttpLink } from 'apollo-link-http'
import { genKeyId } from './keys'
import type { BigNumber } from 'ethers'

const subgraphURI = `http://${
  process.env.CI ? 'graph-node' : '127.0.0.1'
}:8000/subgraphs/name/testgraph`

console.log(subgraphURI)

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
    }
  }
`
export const getLock = async (lockAddress: string) => {
  const {
    data: { lock },
  } = await subgraph.query({
    query: getLockQuery,
    variables: {
      id: lockAddress,
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
export const getKey = async (lockAddress: string, tokenId: BigNumber) => {
  const keyId = genKeyId(lockAddress, tokenId)
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
