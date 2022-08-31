import { Chain, configureChains, createClient } from 'wagmi'
import { networks } from '@unlock-protocol/networks'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { InjectedConnector } from 'wagmi/connectors/injected'

const chainConfigs = Object.entries(networks).map(([_, config]) => {
  return {
    id: config.id,
    name: config.name,
    network: config.name,
    rpcUrls: {
      default: config.provider || config.publicProvider,
    },
    nativeCurrency: config.nativeCurrency,
    testnet: config.isTestNetwork,
  } as Chain
})

const { provider, chains } = configureChains(chainConfigs, [
  jsonRpcProvider({
    rpc: (chain) => {
      return {
        http: chain.rpcUrls.default,
      }
    },
  }),
])

export const client = createClient({
  autoConnect: true,
  connectors: [
    new InjectedConnector({
      chains,
    }),
  ],
  provider: provider as any,
})
