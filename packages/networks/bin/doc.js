const { networks } = require('../dist')

const parseNetwork = ({
  name,
  id,
  unlockAddress,
  explorer,
  nativeCurrency,
  description,
  maxFreeClaimCost,
}) =>
  `
### ${name} ${
    maxFreeClaimCost > 1
      ? "<button class='button icon-button icon-gasless'></button>"
      : ''
  }

${description || ''}

- chainId: ${id}
- native currency: ${nativeCurrency.name} (${nativeCurrency.symbol})
- unlockAddress: [\`${unlockAddress}\`](${explorer.urls.address(unlockAddress)})
`

const doc = `
---
title: Networks
description: >-
  Details on blockchain network deployments of Unlock Protocol.
---

import { GoMarkGithub } from "react-icons/go";
import { SiNpm } from "react-icons/si";

# Networks

You should **not need to deploy an Unlock contract yourself**. Here are the addresses of contracts deployed on respective networks and you can call them directly using the block explorer.

## Package
Included in the core protocol is a networks package. 

<a href="https://github.com/unlock-protocol/unlock/tree/master/packages/networks">
  <button class="button button-primary margin-bottom--md">
    <GoMarkGithub className='react-icons' /> Unlock Repo / Networks Subdirectory
  </button>
</a>

This package includes all of the network addresses as well as [rpc endpoints](../../tools/rpc-provider.md) that you can use for development environments.

<a href="https://www.npmjs.com/package/@unlock-protocol/networks">
  <button class="button button-primary margin-bottom--md">
    <SiNpm className='react-icons' /> npm @unlock-protocol/networks
  </button>
</a> 

### Adding it in your project

using yarn
\`\`\`shell
yarn add @unlock-protocol/networks
\`\`\`
or npm
\`\`\`shell
npm i @unlock-protocol/networks
\`\`\`

## Deployments

${Object.keys(networks)
  .filter((chainId) => chainId !== '31337')
  .map((chainId) => parseNetwork(networks[chainId]))
  .join('')}
`

console.log(doc)
