import ApolloClient from 'apollo-boost'
import { utils } from 'ethers'
import locksByOwner from '../queries/locksByOwner'
import { Lock } from '../unlockTypes'

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

    // the Graph returns lower cased addresses.
    // To make sure we stay consistent with the rest of the app
    // We use checksumed addresses.
    return result.data.locks.map((lock: Lock) => {
      return {
        ...lock,
        address: utils.getAddress(lock.address),
      }
    })
  }
}
