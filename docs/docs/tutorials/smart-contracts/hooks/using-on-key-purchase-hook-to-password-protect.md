---
title: Creating a hook to password-protect purchases
description: In this tutorial we follow the steps to create a hook that create a password protected flow for purchases on a hook.
---

> If you are not a developer but just a creator trying to use an existing hook, please check out guide on [how to password-protect NFT purchases](https://unlock-protocol.com/guides/password-protected-nft-memberships/) on your lock. You can do it directly from the Unlock Dashboard UI as well!

Our goal here is to create a system where purchases on a lock are restricted to people who know a specific password.

There is obviously a front-end element, where purchasers would have to enter the password as they go through the checkout (we implemented this flow in our [Checkout UI](../../../tools/checkout/README.md)). However, if we only implemented this protection on the front-end, people could bypass this protection by calling the `purchase` function of the contract directly: we also need to add a mechanism to the smart contract.

When the lock contract itself does not have a feature that we want, we can use hooks. Since our goal is to limit the "purchases" to people who know the password, then we need to use the `onKeyPurchaseHook`. Additionally the `purchase` function includes an extra `data` argument which is passed to the hook!

The first obvious approach would be to pass the password as `data`, and then have the hook verify that it matches what we expect. Unfortunately that would not work very well because we would need to store the password in the hook and someone could read it (even if we use a `private` variable), and it would be passed _in clear_ in the transaction data so it would be readable on block explorers!

So, rather than pass it in clear, we would need to pass a blob that _only_ someone who knows the password can compute! We would also need for that blob to be different for everyone, so that someone who observes the chain cannot just simply re-use someone else's blob!

**Here is the approach we're taking:**

1. From the password, we generate/derive a private key
1. We store in the hook the corresponding public key
1. With the private key we sign the purchaser's address
1. We pass the signature as a blob in the purchase function
1. The hook "recovers" the signer of the message and verifies that it matches the stored public key!

Only people who know the password can generate the right private key and since every purchaser's address is different, the blob is different for everyone!

## Writing the code

For smart-contract development, we recommand using [Hardhat](https://hardhat.org/). They provide a full environment to write, compile, test and deploy contracts. Check up their [tutorial section](https://hardhat.org/tutorial) if you're getting started.

Create your project:

```shell
mkdir password-hook
cd password-hook
npx hardhat
```

Select `Create a JavaScript project`.

Then, you should have a directory that contains all the base elements. Let's start by removing the very confusing `contracts/Lock.sol` (that's a demo contract created by the plugin that has _nothing to do with Unlock!_). You should also remove `test/Lock.js`.

Next, install the 2 dependencies, the [Unlock Hardhat plugin](../../../tools/hardhat-plugin.md) and `@openzeppelin/contracts` which includes the ECDSA library used to verify signatures.

```shell
npm install --save @unlock-protocol/hardhat-plugin
npm install --save @openzeppelin/contracts
```

Finally, let's make sure Hardhat knows about this plugin.
In the `hardhat.config.js` file, you just need to add the following line (at the top):

```js
require('@unlock-protocol/hardhat-plugin')
```

We are now ready to write some code! Let's create the source file for our hook:

```
touch contracts/PurchaseHook.sol
```

And let's now add the most basic implementation of a purchase hook that does... nothing!

```solidity
pragma solidity ^0.8.0;

import '@unlock-protocol/contracts/dist/PublicLock/IPublicLockV10.sol';

contract PurchaseHook {
  /** Constructor */
  constructor() {}

  /**
   * Function that is called at the beginning of the
   * `purchase` function on the Public Lock contract.
   * It is expected to return the price that has to be
   * paid by the purchaser (as a uint256). If this
   * reverts, the purchase function fails.
   */
  function keyPurchasePrice(
    address /* from */,
    address /*recipient */,
    address /* referrer */,
    bytes calldata /* data */
  ) external view returns (uint256 minKeyPrice) {
    return IPublicLockV10(msg.sender).keyPrice();
  }

  /**
   * Function that is called at the end of the `purchase`
   * function and that can be used to record and store
   * elements on the hook. Similarly, if this reverts, the
   * purchase function fails.
   */
  function onKeyPurchase(
    address /*from*/,
    address /*recipient*/,
    address /*referrer*/,
    bytes calldata /*data*/,
    uint256 /*minKeyPrice*/,
    uint256 /*pricePaid*/
  ) external {
    // Do nothing
  }
}
```

As you can see it really has 2 functions: `keyPurchasePrice` and `onKeyPurchase`. The first one returns the key price stored on the lock (so everyone pays the price set there) and the second one does nothing.

Next, let's actually write a basic test to make sure that things work. Hardhat comes with its own execution environment which means we don't have to worry about running an EVM node, or deploying the contract to a test network... etc.

```javascript
const { expect } = require('chai')
const { ethers, unlock } = require('hardhat')

describe('PurchaseHook', function () {
  before(async () => {
    // Deploy the core Unlock protocol
    await unlock.deployProtocol()
  })

  it('should work as a hook', async function () {
    const [user] = await ethers.getSigners()

    // Deploy a lock
    const { lock } = await unlock.createLock({
      expirationDuration: 60 * 60 * 24 * 7,
      maxNumberOfKeys: 100,
      keyPrice: 0,
      name: 'My NFT membership contract',
    })

    // Deploy the hook
    const PurchaseHook = await ethers.getContractFactory('PurchaseHook')
    const hook = await PurchaseHook.deploy()
    await hook.deployed()

    // Attach the hook to our lock
    await (
      await lock.setEventHooks(
        hook.address, // The first address is the onKeyPurchase hook
        ethers.constants.AddressZero, // Other non-used hooks
        ethers.constants.AddressZero,
        ethers.constants.AddressZero
      )
    ).wait()

    // And now make a purchase
    await expect(
      lock.purchase([0], [user.address], [user.address], [user.address], [[]])
    ).not.to.reverted
  })
})
```

We can run the test via the command line with the following:

```shell
yarn hardhat test
```

And you should see an output that looks like this:

```
  PurchaseHook
UNLOCK > deployed to : 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
PUBLICLOCK > deployed to : 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
    ✔ should work as a hook (90ms)

  1 passing (799ms)

✨  Done in 1.48s.
```

Our hook works! We can now start implementing the logic to check the password. For this, we will just update the content of the `keyPurchasePrice` function. Indeed, it will check if the `data` (last argument) does not match, we should revert with an error and make the purchase call fail.

Before that, let's update the `constructor` to save the signer when we deploy the contract. We also will need to create a private attribute to save the `signer`.

We are also adding the error.

```solidity
address private _signer;

error WRONG_PASSWORD();

/** Constructor */
constructor(address signer) {
  _signer = signer;
}
```

Then, we can update the function:

```solidity
/**
 * Price is the same for everyone...
 * but we fail if signer of data does not match
 * the lock's password.
 */
function keyPurchasePrice(
  address /* from */,
  address recipient,
  address /* referrer */,
  bytes calldata signature /* data */
) external view returns (uint256 minKeyPrice) {
  if (getSigner(addressToString(recipient), signature) == signer) {
    return IPublicLock(msg.sender).keyPrice();
  }
  revert WRONG_PASSWORD();
}
```

In the code above, you can identify 2 functions that we're implementing below: `addressToString` which converts an address into a string (Solidity does not have native casting from address to string) so that we can process it and `getSigner` which, given a message and a signature can return the address of the signer.

```solidity
/**
 * Helper function to cast an address into a string.
 */
function addressToString(address signer) public pure returns (string memory) {
  bytes memory alphabet = '0123456789abcdef';
  bytes memory data = abi.encodePacked(signer);
  bytes memory str = new bytes(2 + data.length * 2);
  str[0] = '0';
  str[1] = 'x';
  for (uint256 i = 0; i < data.length; i++) {
    str[2 + i * 2] = alphabet[uint256(uint8(data[i] >> 4))];
    str[3 + i * 2] = alphabet[uint256(uint8(data[i] & 0x0f))];
  }
  return string(str);
}

/**
 * Verification function which, given a message and a
 * signature returns the address of the signer.
 * It leverages the ECDSA libraries from OpenZeppelin
 */
function getSigner(
  string memory message,
  bytes calldata signature
) public pure returns (address recoveredAddress) {
  bytes32 hash = keccak256(abi.encodePacked(message));
  bytes32 signedMessageHash = ECDSA.toEthSignedMessageHash(hash);
  return ECDSA.recover(signedMessageHash, signature);
}
```

We are done implemeting our hook, so let's add a few more tests! We are refactoring the test created above by adding 3 cases: calling purchase without a password, calling purchase with a "bad" password, and calling purchase with the correct password.

We start by adding 2 helper functions:

- `createWalletFromPassword`: given a string (the password), this function creates a private key (and its corresponding public key).
- `signMessage`: this function should also be used by any front-end application to convert the user-entered password. This uses the `ethers` library.

```javascript
/**
 * Creates a wallet from a password.
 * @param {*} password
 */
const createWalletFromPassword = async (password) => {
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ['bytes32'],
    [ethers.utils.id(password)]
  )
  const privateKey = ethers.utils.keccak256(encoded)
  return new ethers.Wallet(privateKey)
}

/**
 * Helper function
 * @param {*} password
 * @param {*} message
 * @returns
 */
const signMessage = async (wallet, message) => {
  const messageHash = ethers.utils.solidityKeccak256(
    ['string'],
    [message.toLowerCase()]
  )
  const messageHashBinary = ethers.utils.arrayify(messageHash)
  return wallet.signMessage(messageHashBinary)
}
```

We can now write the full test.

```javascript
const { expect } = require('chai')
const { ethers, unlock } = require('hardhat')

/**
 * Creates a wallet from a password.
 * @param {*} password
 */
const createWalletFromPassword = async (password) => {
  const encoded = ethers.utils.defaultAbiCoder.encode(
    ['bytes32'],
    [ethers.utils.id(password)]
  )
  const privateKey = ethers.utils.keccak256(encoded)
  return new ethers.Wallet(privateKey)
}

/**
 * Helper function
 * @param {*} password
 * @param {*} message
 * @returns
 */
const signMessage = async (wallet, message) => {
  const messageHash = ethers.utils.solidityKeccak256(
    ['string'],
    [message.toLowerCase()]
  )
  const messageHashBinary = ethers.utils.arrayify(messageHash)
  return wallet.signMessage(messageHashBinary)
}

describe('PurchaseHook', function () {
  before(async () => {
    // Deploy the core Unlock protocol
    await unlock.deployProtocol()
  })

  it('should work as a hook', async function () {
    const [user] = await ethers.getSigners()

    const password = 'ThiS Is s3cr3+'
    const signerWallet = await createWalletFromPassword(password)

    // Deploy a lock
    const { lock } = await unlock.createLock({
      expirationDuration: 60 * 60 * 24 * 7,
      maxNumberOfKeys: 100,
      keyPrice: 0,
      name: 'My NFT membership contract',
    })

    // Deploy the hook
    const PurchaseHook = await ethers.getContractFactory('PurchaseHook')
    const hook = await PurchaseHook.deploy(signerWallet.address)
    await hook.deployed()

    // Attach the hook to our lock
    await (
      await lock.setEventHooks(
        hook.address, // The first address is the onKeyPurchase hook
        ethers.constants.AddressZero, // Other non-used hooks
        ethers.constants.AddressZero,
        ethers.constants.AddressZero
      )
    ).wait()

    // And now make a purchase without a password, it should revert
    await expect(
      lock.purchase([0], [user.address], [user.address], [user.address], [[]])
    ).to.reverted

    // And now make a purchase with the wrong password, it should revert
    const wrongSignerWallet = await createWalletFromPassword('wrong password')
    const wrongSignature = signMessage(wrongSignerWallet, user.address)
    await expect(
      lock.purchase(
        [0],
        [user.address],
        [user.address],
        [user.address],
        [wrongSignature]
      )
    ).to.reverted

    // And now make a purchase with the correct password, it should not revert
    const signature = signMessage(signerWallet, user.address)
    await expect(
      lock.purchase(
        [0],
        [user.address],
        [user.address],
        [user.address],
        [signature]
      )
    ).to.not.reverted
  })
})
```

Make sure you run the tests again and they should pass!

Please [check this repo](https://github.com/unlock-protocol/password-required-hook) for a fully implemented hook that supports multiple locks (in other words it is directly usable for your application).

## Deploying

Hardhat currently relies on writing scripts to deploy contracts. Since this is not specific to Unlock or this project, we invite you to [check out the Hardhat docs](https://hardhat.org/hardhat-runner/docs/guides/deploying).
