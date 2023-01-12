---
title: Unlock ABI modules
subTitle: We publish our ABI as npm modules
authorName: Julien Genestoux
publishDate: May 13, 2020
description: We publish our ABI as npm modules
image: /images/blog/unlock-abi-modules/npm-logo.png
---

# ABI

We write our smart contracts using the [Solidity](https://solidity.readthedocs.io/) language. Once compiled they are deployed to the Ethereum chain. Ethereum nodes, such as the ones from [Alchemy](https://alchemyapi.io/) (which we use and love!), provide RPC endpoints to retrieve or alter the state of the contracts.

The "description" of the method calls is inside of the Application Binary Interface (ABI). The Contract ABI is the standard way to interact with contracts in the Ethereum ecosystem, both from outside the blockchain and for contract-to-contract interaction. Data is encoded according to its type, as described in this specification. The encoding is not self describing and thus requires a schema in order to decode.

We verify all of our contract on Etherscan, which means that creators and consumers can easily inspect each implementation and ensure that the protocol works as they expect. You can also use Etherscan to inspect the ABI themselves. See for example [the ABI of the lock on this blog](https://etherscan.io/address/0xCE62D71c768aeD7EA034c72a1bc4CF58830D9894#code).

# npm modules

3rd party developers can use our ABIs directly, but, for convenience, we also provide npm modules. These modules can be used inside of JavaScript applications, either front-end or backend! The module can also be used with other Solidity applications since several solidity developer tools, such as Truffle! For example, you can look at [our very own smart contract extensions](https://github.com/unlock-protocol/unlock/tree/master/smart-contract-extensions)!

We publish each and every ABI as module for every version that we publish!

- [unlock-abi-1](https://www.npmjs.com/package/@unlock-protocol/unlock-abi-1)
- [unlock-abi-2](https://www.npmjs.com/package/@unlock-protocol/unlock-abi-2)
- [unlock-abi-3](https://www.npmjs.com/package/@unlock-protocol/unlock-abi-3)
- [unlock-abi-4](https://www.npmjs.com/package/@unlock-protocol/unlock-abi-4)
- [unlock-abi-5](https://www.npmjs.com/package/@unlock-protocol/unlock-abi-5)
- [unlock-abi-6](https://www.npmjs.com/package/@unlock-protocol/unlock-abi-6)
- [unlock-abi-7](https://www.npmjs.com/package/@unlock-protocol/unlock-abi-7)

The Unlock contract, which is a factory contract will always deploy locks from the _latest_ version, but older locks are, by design, not updagradable by us, which means that they will remain on the version at the time of their deployment. You should use etherscan to inspect which version a specific lock uses!
