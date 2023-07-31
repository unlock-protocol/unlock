---
title: Using Thirdweb
description: >-
  In this tutorial, we are exploring the use of Thirdweb to deploy and build applications with Unlock!
---

[Thirdweb](https://thirdweb.com/) provides a powerful SDKs and intuitive tools for developers to build and ship applications faster.

We released the [Public Lock contract to ThirdWeb's registry](https://thirdweb.com/unlock-protocol.eth).

## Deploying a Public Lock

You can deploy membership contracts using Thirdweb's interface. On the [Public Lock](https://thirdweb.com/unlock-protocol.eth/PublicLock) page, click the `Deploy Now` button. This will open a form where you can complete the required configuration for the deployment of your lock. These values depend on what version of the [Public Lock](../../core-protocol/public-lock/) you want to deploy but will likely include the address of the first [lock manager](../../core-protocol/public-lock/access-control.md), the duration, the number of memberships, or the price and currency contract address.

You will also be prompted to choose a network on which to deploy the contract. We recommend using a test network in order to build applications. You will be able to swap addresses for a production network when you are ready to ship your application!

<iframe width="560" height="315" src="https://www.youtube.com/embed/cNdEFMm2pvI" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Using the explorer

Once deployed, your public lock is now usable through ThirdWeb's explorer. The interface is fairly similar to what block explorers like Etherscan offer and you can use it to read state from the contract, or change the contract's properties and state.

<iframe width="560" height="315" src="https://www.youtube.com/embed/02spfu9Xsg0" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

The UI also provides a way to list all events triggered on the contract, or even list NFTs minted by the contract.

## Using the SDK

Finally, you can now easily start using ThirdWeb's SDK to create your applications! They provide libraries for React, Web3Button (which is a library provided by ThirdWeb), Javascript, Python and Go!

The `Code` tab under your contract even provides small snippets of code to show developers how to integrate smart contract calls into their applications. Here is for example how you could trigger a `purchase` using their SDK:

```javascript
import { useContract, useContractWrite } from "@thirdweb-dev/react";

export default function Component() {
  const { contract } = useContract(
    "0x2C2fb85b9Eb615Ed2a008B9225E187cCd30cdF1c"
  );
  const { mutateAsync: purchase, isLoading } = useContractWrite(
    contract,
    "purchase"
  );

  const call = async () => {
    try {
      const data = await purchase([
        _values,
        _recipients,
        _referrers,
        _keyManagers,
        _data,
      ]);
      console.info("contract call success", data);
    } catch (err) {
      console.error("contract call failure", err);
    }
  };
}
```
