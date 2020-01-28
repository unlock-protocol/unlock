import fetch from 'isomorphic-fetch'
import gql from 'graphql-tag'
import ApolloClient from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

export class Querier {
  client: any

  constructor(sourceURI: string) {
    let cache = new InMemoryCache()
    let link = new HttpLink({
      uri: sourceURI,
      fetch,
    })

    this.client = new ApolloClient({
      link,
      cache,
    })
  }

  async query() {
    let queryResults = await this.client.query({
      query: gql`
        {
          keys {
            lock {
              address
              name
            }
            keyId
          }
        }
      `,
    })

    return queryResults.data.keys.map((currentResult: any) => {
      return {
        keyId: currentResult.keyId,
        lockAddress: currentResult.lock.address,
        lockName: currentResult.lock.name  
      }
    })
  }
}
