import fetch from 'isomorphic-fetch'
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { HttpLink } from 'apollo-link-http'

const subgraphURI = 'http://127.0.0.1:8000/subgraphs/name/testgraph'

const link = new HttpLink({
  uri: subgraphURI,
  fetch,
})

export const subgraph = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})
