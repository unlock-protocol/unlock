---
title: Dynamic NFT
subTitle: How Tales of Elatora is making dynamic NFT images
authorName: Julien Genestoux
publishDate: May 4, 2022
description: By leveraging some of the important features of the Unlock contracts, it is possible to make the visual NFT evolve based on some on-chain data characteristics.
image: TK
---

[Tales of Elatora](https://talesofelatora.com/) is a game where players need an avatar to play. The Avatars are non-fungible tokens using the Unlock protocol contract. There are two factions: the Buntai and the Gundan.

Players also need weapons to play. Weapons are also NFTs, and a Buntai avatar can only use a Buntai weapon and a Gundan avatar can only use a Gundan weapon. Anyone who buys an avatar automatically receives a matching weapon, as you can see on [this transaction](https://etherscan.io/tx/0x0f61fd3cdfb520804f59bc5de2ab70c131313a55d3e692bbec4c2a66777e03b7) for example.

![2 NFT](/images/blog/dynamic-nft/transaction-2-nft.png)

# The `OnKeyPurchase` hook

The PublicLock contract is highly programmable through the use of [hooks](https://github.com/unlock-protocol/docs/tree/master/developers/smart-contracts/lock-api/hooks). These hooks are external contracts that are used to alter the behavior of a PublicLock contract or trigger actions in other contracts. Any lock manager can configure hooks on a lock using the `setEventHooks` function. Each hook needs to implement a few functions and you can also use a single hook contract with all functions.

`onKeyPurchaseHook` is one of the hooks. This hook is called when the `purchase` function of a lock is called. It needs to implement 2 distinct functions:

- `keyPurchasePrice`: this first function is called with the address of the sender of the purchase transaction, the address of the recipient of the NFT membership, as well as the `referrer` and `data` parameters of the `purchase` function. The return value is the price paid for this specific membership. If your contract wants to offer discounts to a list of addresses or change the price based on how much time has passed since the last purchase, this function is a great way to achieve that!

- `onKeyPurchase`: this second function is called with the same arguments as `keyPurchasePrice` (from, recipient, referrer and data), but also with the minimum price this user has to pay as well as the price they actually paid (this would be different in the context of tips for example). This function is called at the tail end of the `purchase` function as a way to trigger other actions.

Tales of Elatora's avatar contract uses a hook to airdrop a weapon to anyone who buys an avatar automatically! Here is the code:

```solidity
  function onKeyPurchase(
    address, /*from*/
    address recipient,
    address, /*referrer*/
    bytes calldata, /*data*/
    uint256, /*minKeyPrice*/
    uint256 /*pricePaid*/
  ) external {
    if (msg.sender == _avatarLock) {
      // If the sender is the avatar lock
      IPublicLock avatar = IPublicLock(_avatarLock);
      uint id = avatar.totalSupply();

      address[] memory recipients = new address[](1);
      recipients[0] = recipient;

      uint[] memory expirations = new uint[](1);
      expirations[0] = type(uint256).max; // Not expiring!

      address[] memory managers = new address[](1);
      managers[0] = recipient;

      if (id % 2 == 0) {
        IPublicLock(_buntaiLock).grantKeys(recipients, expirations, managers);
      } else {
        IPublicLock(_gundanLock).grantKeys(recipients, expirations, managers);
      }
    }
  }
```

The Avatars are such that every even number is a Buntai and every odd is a Gundan. The hook calls the `grantKeys` function on the right contract based on that.
Of course, that means that the Hook contract has been previously set to be a `keyGranter` on both locks ([see more info on the roles](https://docs.unlock-protocol.com/unlock/developers/smart-contracts/lock-api/access-control)).

# The `onTokenUri` Hook

An even more exciting hook that the PublicLock contract includes is the `onTokenUri` hook. This hook alters how the `tokenUri` method behaves. This method is the one in charge of yielding the URI that itself renders the JSON blob that includes the image, and other metadata for each individual Non Fungible Token.

The URI that the contract yields can in fact be a [data URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs). Data URLs, URLs prefixed with the `data:` scheme, are self-referrential: the URL itself contains the data that's represented by the browser. Here is an example: `data://text,hello%20unlock` is a URL which opens as a new page whose content is just "hello unlock".

By using a data URL as the `tokenUri` return, we can render metadata dynamically. The Tales of Elatora avatars are using this technique to render the image differently based on 2 things:

- whether the owner of the avatar also owns a weapon, and in which case, render the avatar along with the weapon
- whether the avatar is rendered during the day, at night, or during sunset.

Once configured, the `onTokenUri` hook will let the Public Lock contract call a 3rd party contract to generate the JSON. Given an `image` string (see below for more details), this is what the Tales of Elatora Public lock does:

```solidity
// Create the json that includes the image
// It is also possible to add more properties to the JSON object
string memory json = string(
    abi.encodePacked('{ "image": "', image, '"')
);

// render the base64 encoded json metadata
return
    string(
        abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(abi.encodePacked(json)))
        )
    );
```

We now only have to generate the `image` itself. Using the same technique, it would be perfectly possible create an SVG (or another image type!) on the fly, but Tales of Elatora used another approach: dynamically generating URLs pointing to files pre-uploaded on IPFS. Then, they use the contract's state to generate the URL that it needs to point to.

Caroline and David, leads on the Tales of Elatora project, generated images of all the possible combinations of avatars, weapons and backgrounds (including the absence of a weapon), and then uploaded all of the images to IPFS using the following pattern: `{avatar-id}-{weapon-id}-{background}.svg`.

The hook implements its own `tokenURI` method.

```solidity
function tokenURI(
    address lockAddress,
    address operator, // We could alter the rendering based on _who_ is viewing!
    address owner,
    uint256 keyId,
    uint256 expirationTimestamp // a cool trick could be to render based on how far the expiration is
) external view returns (string memory) {
   // ...
   // custom implementation
   /// ...
}
```

Specificaly, Tales of Elatora implements the hook by first checking if the `owner` of the Avatar also owns a corresponding weapon. If so, the final URL will include point to it (the `{weapon-id}` part), if not, it will use `0` for the `{weapon-id}`.

Similarly, the background of the image is dynamic and changes based on the time of the day! If the contract's `tokenUri` is called between 8am and 5pm GMT, it will render the _day_ background, if it is queried between 5pm and 9pm GMT, it will render the _sunset_ background, and if it is queried between 9pm and 8am GMT, it will render the _night_ background.

## Dynamic contracts

The core goal of the Unlock Protocol is to build a standard for memberships, where all memberships, from Amazon Prime, to Medium's member program, or the Tales of Elatora game work the same, in the same way that every website is made of the same core protocols: HTML, HTTP and others! However, exactly like every website can also be different, we believe memberships can also look and behave differently on some aspects.

Are you interested in deploying your own custom membership? Get in touch!
