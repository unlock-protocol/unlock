import ApolloClient from 'apollo-boost'
import { utils } from 'ethers'
import locksByManager from '../queries/locksByManager'

export class GraphService {
  public client: any

  connect(uri: string) {
    this.client = new ApolloClient({
      uri,
    })
  }

  locksByManager = async (owner: string) => {
    const query = locksByManager()
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
    return result.data.lockManagers.map((manager: any) => {
      return {
        ...manager.lock,
        address: utils.getAddress(manager.lock.address),
      }
    })
  }
}

export default GraphService
