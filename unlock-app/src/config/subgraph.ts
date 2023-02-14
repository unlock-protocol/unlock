import { SubgraphService } from '@unlock-protocol/unlock-js'
import { config } from './app'

export const subgraph = new SubgraphService(config.networks)
