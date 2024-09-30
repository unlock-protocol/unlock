import fs from 'fs-extra'
import path from 'path'

// We use Partial<NetworkConfig> for localhost as we don't have all the information
const defaultLocalhost = {
  chain: 'localhost',
  description: 'Localhost network.',
  featured: false,
  fullySubsidizedGas: true,
  id: 31337,
  isTestNetwork: true,
  name: 'Localhost',
  nativeCurrency: {
    coingecko: 'ethereum',
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  provider: 'http://127.0.0.1:8545',
  publicLockVersionToDeploy: 14,
  publicProvider: 'http://127.0.0.1:8545',
  subgraph: {
    endpoint: '',
    graphId: 'graphId',
  },
}

const generateLocalhostNetworkFile = ({
  unlockAddress,
  subgraphEnpoint = 'http://localhost:8000/subgraphs/name/testgraph',
}) => {
  const localhost = {
    ...defaultLocalhost,
    subgraph: {
      endpoint: subgraphEnpoint,
      graphId: 'graphId',
    },
    unlockAddress,
  }

  // log for debug purposes on CI
  console.log(localhost)

  // output to js file
  const parsed = `import { NetworkConfig } from '@unlock-protocol/types'
  
// We use Partial<NetworkConfig> for localhost as we don't have all the information
export const localhost: Partial<NetworkConfig> = ${JSON.stringify(localhost)}
export default localhost
  `
  return parsed
}

const run = async () => {
  const [unlockAddress, subgraphEnpoint] = process.argv.slice(2)
  console.log(`Creating localhost file for unlockAddress ${unlockAddress}`)

  if (!unlockAddress) {
    throw new Error('Missing unlockAddress arg')
  }

  const fileContent = generateLocalhostNetworkFile({
    subgraphEnpoint,
    unlockAddress,
  })

  const filePath = path.resolve('./src/networks/localhost.ts')

  await fs.writeFile(filePath, fileContent)
}
run()
  .then(() => console.log('done'))
  .catch((err) => {
    throw err
  })
