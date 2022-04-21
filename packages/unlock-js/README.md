# unlock-js

Unlock-js is an npm module that provides a wrapper around the Unlock smart contract ABIs to simplify interactions with the protocols smart contracts (both Unlock and PublicLock).

It is used in production by the Unlock front-end applications and can be deployed both on server side (node.js) applications and front end applications (using your favorite JavaScript framework).

One of the core goals of this library is to abstract the complexity of the multiple Unlock and PublicLock versions with a single library. It covers some of the data type conversions so that API calls are more user-friendly (strings instead of BigInts).

You can find more docs and detailed usage examples in [Unlock's main documentation](https://docs.unlock-protocol.com/developers/unlock.js).

## Scripts

This library also includes a few scripts that are usable to perform some actions.
To use it, clone the repo and install its dependencies (follow the Getting Started section on the main README).

For example, you can use the following command to grant keys:

```bash
yarn run grant-keys <network id> <lock address> <recipient>,<expiration?>,<manager?>...
```

Where `network id`, `lock address` are respectively the network id and lock address. And `recipient`, `expiration` and `manager` are respectively the recipient, the desired expiration and manager for the granted keys. If `expiration` is not set, it will be based on the lock's duration. If `manager` is left empty, it will be set to senders address.

You need to set `export PRIVATE_KEY=...` that will be used to grant keys.

Example:

```bash
yarn run grant-keys 4 0x6F6A5558743Fe28F5F4106a83b1E42cF2cB36C0B 0xDD8e2548da5A992A63aE5520C6bC92c37a2Bcc44,1,0xDD8e2548da5A992A63aE5520C6bC92c37a2Bcc44 julien51.eth
```
