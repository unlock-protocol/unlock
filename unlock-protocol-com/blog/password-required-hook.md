---
title: Password Required
subTitle: Introducing a new way to password protect the membership NFT purchases!
authorName: Julien Genestoux
publishDate: Sept 16, 2022
description: Using a smart contract hook, it is now possible to require users to enter a password when they are making purchases, ensuring that only your community can purchase memberships!
image: /images/blog/password-protected/password-protected.png
---

A fairly common request by event organizers and creators revolves around selling memberships in a password-protected way: only those who know the password can purchase.

![Password Protected](/images/blog/password-protected/password-protected.png)

Today, we’re excited to announce how **creators can easily use their membership contract (a lock), a hook, and our checkout URL flow to password-protect purchases**.

Of course, this process is *secured* and cannot be bypassed by calling the contract directly, as the password is used to submit the transaction on-chain. Additionally, the password is not transmitted “in the clear” to ensure that it remains secret but used to sign the recipient’s address, making the transaction unique for each user.

The hooks were deployed on the production networks (and can easily be added to more):

- [Ethereum](https://etherscan.io/address/0xe87eFc02F26EFE45171afDBEc85D743FDB2Eb1FB#code)
- [Polygon](https://polygonscan.com/address/0xD925Ac2887Ba4372849F0fd64217A6749552bb21)
- [Gnosis Chain](https://blockscout.com/xdai/mainnet/address/0xe87eFc02F26EFE45171afDBEc85D743FDB2Eb1FB)

## Example

[This lock](https://goerli.etherscan.io/address/0x44Dc120086c34305098c379eB5638Bfc0d31D47a) deployed is deployed on Goerli and uses this password hook. This means you can only purchase a key if you go [through this checkout URL](https://app.unlock-protocol.com/checkout?redirectUri=https%3A%2F%2Funlock-protocol.com&paywallConfig=%7B%22locks%22%3A%7B%220x44Dc120086c34305098c379eB5638Bfc0d31D47a%22%3A%7B%22network%22%3A5%7D%7D%2C%22pessimistic%22%3Atrue%2C%22persistentCheckout%22%3Atrue%2C%22icon%22%3A%22https%3A%2F%2Flocksmith.unlock-protocol.com%2Flock%2F0x44Dc120086c34305098c379eB5638Bfc0d31D47a%2Ficon%22%2C%22password%22%3Atrue%7D) and if you enter the right password: `sek3e+-pass30rD`. Please try with a bad password first!

![Password Required!](/images/blog/password-protected/purchase-password.png)

## Using the hook for your own lock

Adding a password to your lock requires the use of a hook. Hooks are a very powerful mechanism used to alter the behavior of your lock. Here is a quick guide and you can find a [longer version in our Guides](https://unlock-protocol.com/guides/password-protected-nft-memberships/).

1. First, you need to choose a password, then [go to this page to generate the corresponding Ethereum address](https://unlock-protocol.github.io/password-required-hook/).

![Generate Signer!](/images/blog/password-protected/generate-signer.png)

2. Then, click on which network your lock has been deployed on ([list here](https://github.com/unlock-protocol/password-required-hook)) to go to the block explorer page for the hook and head to `Contract` > `Write Contract`. Connect your wallet (you need to be connected as a lock's manager) and click on `setSigner`. There, enter the lock address and then the wallet address generated in the previous step.

![Set Signer!](/images/blog/password-protected/set-signer.png)

3. Finally, you need to point your lock to the hook. Using your lock's block explorer page, click on `Contract` > `Write as Proxy`. Connect your wallet (you need to be connected as a lock's manager) and look for `setEventHooks`. In the `_onKeyPurchaseHook` enter the address of the hook (from the list above), and enter `0x0000000000000000000000000000000000000000` for all the other hooks (unless of course, you want to use them...).

![Set Hooks!](/images/blog/password-protected/set-hooks.png)

4. [Build a Checkout URL](https://docs.unlock-protocol.com/tools/checkout/configuration) and make sure you include the `"password": true` option in it so that users are prompted for the password when they go through the checkout flow!

## Developers

Even though this hook is “readily” usable, exactly like our “bring your own contract” hooks created a few months ago, we felt that it was a very good example of [how to create hooks for your smart contract](https://docs.unlock-protocol.com/tutorials/smart-contracts/hooks/using-on-key-purchase-hook-to-password-protect). As such, we created a dedicated tutorial that you can refer to see how we created it and use that as an inspiration to create your own hooks!

You can find the code for this [password-protected hook on Github](https://github.com/unlock-protocol/password-required-hook) as well as the [tutorial in our docs](https://docs.unlock-protocol.com/tutorials/smart-contracts/hooks/using-on-key-purchase-hook-to-password-protect).
