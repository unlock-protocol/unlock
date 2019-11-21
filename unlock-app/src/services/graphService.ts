import ApolloClient from 'apollo-boost'

import locksByOwner from '../queries/locksByOwner'

export default class GraphService {
  public client: any

  constructor(uri: string) {
    this.client = new ApolloClient({
      uri,
    })
  }

  locksByOwner = async (owner: string) => {
    const query = locksByOwner()
    const result = await this.client.query({
      query,
      variables: {
        owner,
      },
    })

    // TODO: map fields so that we get the same output values than unlock-js (keyPrice should use decimals... etc)
    return result.data.locks
  }
}
