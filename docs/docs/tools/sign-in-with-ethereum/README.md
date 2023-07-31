---
sidebar_position: 2
description: >-
  In most applications, the first step is to identify users, Unlock provides an easy way to identify users.
---

# Sign-in With Ethereum

In many contexts, your application does not need a full "web3" provider, but just a way to identify the user's address. Unlock offers a flow that allows any application to easily identify the user by requiring them to sign a message. For this, we use a flow that's based on the [EIP 4361](https://eips.ethereum.org/EIPS/eip-4361) and that's inspired by the OpenId Connect and OAuth flows where the user is redirected back to the application once they have authenticated.

> "_Ethereum_" here does not refer to any network in particular but to the type of wallet that can used. Since Polygon, Gnosis Chain or Optimism for example are all using the same wallet, you can (should!) absolutely use the same "Sign In with Ethereum".

> Yeah, the sign in with Ethereum seems confusing to make you think it's all about Ethereum only. No, it covers web3 sign in as a whole not just Ethereum (though initially, it all started with Ethereum - no wonder the confusing naming).

By using Unlock's "Sign-In with Ethereum", users who do not have a crypto wallet can also easily create an [Unlock Account](/tools/sign-in-with-ethereum/unlock-accounts), as well as sign in to their existing account with their email and passwords.

### Video: Using Sign In With Ethereum and Unlock Protocol
Click to watch the step by step video guide below:

[![Video of Using Sign In With Ethereum and Unlock Protocol](/img/tools/sign-in-with-ethereum/Unlock-Protocol-Images00001a-Sign-In-With-Ethereum-YT-Thumbnail.jpg 'Video of Using Sign In With Ethereum and Unlock Protocol')](https://www.youtube.com/watch?v=L4pMLwXVzto)

### Building a "Sign-in With Ethereum" URL

Your application just needs to build these URLs using the following:

Endpoint: [`https://app.unlock-protocol.com/checkout?`](https://app.unlock-protocol.com/checkout?client_id=ouvre-boite.com&redirect_uri=https://ouvre-boite.com/)\`\`

Required query parameters:

- `redirect_uri`: the URL toward which the user is redirected once they have connected their wallet and signed the message to authenticate them
- `client_id` : a string to identify your application. It MUST match the "host" part of the `redirect_uri`.

Optional query parameters:

- `paywallConfig` : a JSON object built using the same structure in purchase URLs. You can customize the `messageToSign` and `icon` elements in particular.

### Redirects

If the user refuses to connect and/or sign a message in their wallet, they will be redirected back to the `redirect_uri` and a new query string parameter will be attached `?error=access-denied`.

If the user connected their wallet and signed the messages, they will also be redirected to your application, this time with a `code` extra query parameter. The value of this parameter is base64 encoded and can be decoded by your application in order to retrieve the signature message along with the message that was signed. Using these 2 values, you can "recover" the address of the signer.

Most Ethereum libraries include a function to compute the signer's address from a message and the corresponding signature:

- `verifyMessage` in [Ethers](https://docs.ethers.io/v5/api/utils/signing-key/#utils-verifyMessage)
- `recover` in [web3.js](https://web3js.readthedocs.io/en/v1.2.11/web3-eth-accounts.html#accounts-recover)
- ... etc

#### Sample code:

```javascript
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
const code = JSON.parse(atob(params.code));
// The code object has 2 properties:
// d: digest (the signed string)
// s: signature (the signature)
const address = ethers.utils.verifyMessage(code.d, code.s);
```

You can try the Sign-In-With Ethereum flow [on this site for example](https://ouvre-boite.com) (click Sign-In). It is also used in our [WordPress plugin](https://unlock-protocol.com/guides/guide-to-the-unlock-protocol-wordpress-plugin/).

Example of message signed:

```
ouvre-boite.com wants you to sign in with your Ethereum account:
0xDD8e2548da5A992A63aE5520C6bC92c37a2Bcc44

URI: https://app.unlock-protocol.com/login
Version: 1
Nonce: rokvh2jf
Issued At: 2022-02-04T18:43:17.178Z
```

### Security considerations

The signed message includes both a timestamp AND a random nonce that your application should leverage to increase the level of confidence that a user's authentication is both recent and "unique". By parsing the signed message your application can extract the following information:

- `domain` of the application to which the user will be redirected. Your application should ignore any signed message where the host does not match your application.
- `Nonce` this is a randomly generated sequence of 8 alphanumerical characters. The collision risk is extremely low, which means that your application should refuse any message with a nonce that's previously been recorded
- `Issued At` : this includes a timestamp in the iso8601 format. Your application should ensure that this timestamps is very recent (within seconds in the vast majority of cases).

Finally, your application may want to take into account the address signed in the message, rather than the actual signer of the message itself as the actual identifier for the account. This is especially useful in the context of smart contract wallets where the signer needs to be an "authorized" signer on the contract. ([See EIP 1271 for more details](https://eips.ethereum.org/EIPS/eip-1271))
