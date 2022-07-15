const { networks } = require('../dist')

const parseNetwork = ({ name, id, unlockAddress, explorer, nativeCurrency }) =>
  `
## ${name}

- chainId: ${id}
- native currency: ${nativeCurrency.name} (${nativeCurrency.symbol})
- unlockAddress: [\`${unlockAddress}\`](${explorer.urls.address(unlockAddress)})
`

const doc = `
# Networks

You should **not need to deploy an Unlock contract yourself**. Here are the addresses of contracts 
deployed on respective networks and you can call them directly using the block explorer.

${Object.keys(networks)
  .filter((chainId) => chainId !== '31337')
  .map((chainId) => parseNetwork(networks[chainId]))
  .join('')}
`

console.log(doc)
