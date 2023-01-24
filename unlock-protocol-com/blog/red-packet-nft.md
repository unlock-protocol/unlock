---
title: How-to do NFT Red Packets
subTitle: Using the public lock contract for fun and profit!
authorName: Julien Genestoux
publishDate: January 24, 2023
description: Let's explore how the Unlock Labs team built a fun experiment by leveraging some of the core characteristics of the PublicLock NFT contract!
image: /images/blog/redpacket-rabbit/redpacket-all-rarities.png
---

🐰 Happy Year of the Rabbit! You can now [open your Hongbao](https://red-packet.unlock-protocol.com/)!

Last week, we [launched a really fun experiment](https://unlock-protocol.com/blog/redpacket-rabbit) inspired by the traditional Chinese gift-giving practice to show appreciation or gratitude.

Today, I want to tell you more about how we built it! The code is [full open-source](https://github.com/unlock-protocol/red-packet-2023) and ready for you to inspect if you want to build similar experiments!

## Front-end

For the front-end, we used Next.js, which, as you probably know is a React-based application framework. We also use Tailwind for the CSS, as well as few common libraries. This is all written in Typescript.

We also used some custom hooks:

- [`useAuth`](https://github.com/unlock-protocol/red-packet-2023/blob/main/hooks/useAuth.tsx) which connects to Unlock's [Sign-In with Ethereum](https://docs.unlock-protocol.com/tools/sign-in-with-ethereum/) endpoint. We used it to identify the users.
- [`useLock`](https://github.com/unlock-protocol/red-packet-2023/blob/main/hooks/useLock.tsx) which queries the RPC endpoint to check if an address owns a valid NFT from the Hongbao contract. We used it to check if a given user already owns an NFT.
- [`useMetadata`](https://github.com/unlock-protocol/red-packet-2023/blob/main/hooks/useMetadata.tsx) which queries the RPC endpoint to retrive the `tokenURI` of a given token. Since the metadata is in fact generated on-chain (more below), this yields it in the form of base64 encoded JSON.

Finally, we also added an API function. When thinking about this experiment, we wanted people to be able to send red packets to _anyone_, even if that person did not previously use the Polygon chain, so that means we needed a mechanism to "claim" the potential prizes in a gasless way because these recipients would otherwise need MATIC tokens to pay for the gas to claim from the red pockets.

```javascript
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!process.env.PRIVATE_KEY) {
    return res.status(500).json('Missing private key')
  }
  const provider = new ethers.providers.JsonRpcProvider(
    'https://rpc.unlock-protocol.com/137'
  )
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY).connect(provider)
  const gasPrice: any = await provider.getGasPrice()
  const hook = new ethers.Contract(
    '0xc328ae7fc36f975be120aaa99f2d96c3e732e5b6', // Address of the RedPacket contract
    ABI, // ABI for the RedPacket contract
    signer
  )
  const { tokenId } = JSON.parse(req.body)
  const tx = await hook.claimPrize(tokenId, { gasPrice }) // call to claim the reward
  res.status(200).json({ hash: tx.hash })
}
```

We'll come back to it, but the function to withdraw can actually be called by anyone as it just sends the money in the envelope to its owner, so we just added a basic API call which can [call the claim function](https://github.com/unlock-protocol/red-packet-2023/blob/main/pages/api/claim.tsx) with a token id. We cover the gas for these calls.

## Smart Contracts

This part is really where the use of the Unlock Protocol shines. First of all, the NFT contract is obviously our `PublicLock`. You can inspect it [using a block explorer](https://polygonscan.com/address/0x01703c979220de3e7662ab90a696843225d31383). We set the price of its NFT to be 1 MATIC. However, we use another contract that we called `RedPacket.sol`. This contract [has also been verified](https://polygonscan.com/address/0xc328ae7fc36f975be120aaa99f2d96c3e732e5b6) and is used as hooks for 2 different functions inside of the PublicLock contract: `onKeyPurchaseHook` and `onTokenUriHook`. The first one is called when new NFTs are being purchased, and the latter when someone tries to retrieve the metadata for a given token.

The `RedPacket.sol` was initialized with a timestamp for the "reveal time", which was set to be midnight on January 22nd in Beijing, China. The purchase hook will prevent any new token from being minted _after_ the reveal.

Additionaly, on every purchase, the hook computes a "random" number. We know that pure randomless is really hard to compute on-chain. Here, we are computing a hash of the block's timestamp, token id and owner combined. This is sufficiently unguessable and hard to manipulate by miners. This random number is stored in the hook (to be used later), as well as used to "shuffle" an array of token by index, by inserting the newly minted token at a random location (this is a variation of the [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)).

```javascript
function onKeyPurchase(
  uint256 tokenId, /* tokenId */
  address from, /* from */
  address, /* recipient */
  address, /* referrer */
  bytes calldata, /* data */
  uint256, /* minKeyPrice */
  uint256 /* pricePaid */
) external {
  if (block.timestamp > revealTime) {
    revert TOO_LATE();
  }
  if (msg.sender != lock) {
    revert NOT_AUTHORIZED();
  }
  // We compute an offset for the final tally
  offset = uint256(keccak256(abi.encodePacked(block.timestamp + tokenId, from))) % 8888888; // Sets the offset!
  // We "randomize" an array that can help us compute winners!
  uint randomIndex = offset % tokenId; // Selects a random index
  if(ranks[randomIndex] > 0) {
    // If we already have a value, swap it
    ranks[tokenId - 1] = ranks[randomIndex]; // Push existing to last
    ranks[randomIndex] = tokenId;
  } else {
    ranks[randomIndex] = tokenId;
  }
}
```

The `tokenURI` function renders the metadata as a base64-encoded JSON string. This means that the NFT metadata is dynamic and generated by the smart contract. Before the reveal time, the metadata points to the `teaser.svg` file, [stored on IPFS](ipfs://QmZ36mis8daTmXWeBcTjfHCSSeQMyWcJH8mNvyB6i8KAXb/teaser.svg).

After reveal, the contract will first determine if a given token has a prize! To do this, we offset the randomized array based on the random number stored on every transaction and get the rank for the given token. This allows the contract to randomize the winning packets in a non-sequential order in a consistent way _after_ the reveal! The metadata then points to the rigth svg file (also stored on IPFS), and includes information about whether indeed the given token has a prize.

Finally the `RedPacket.sol` contract also includes a `claimPrize` function which can be called once for each token and that withdraws the corresponding amount from the lock for any token!

## Conclusion

Unlock is a protocol for memberships that leverages NFT. It is also an incredibly versatile NFT contract that lets anyone build fun and unique experiences that would not be possible to build _without_ blockchains in a trustless way! In December, the Unlock Labs team released an Avent Calendar, last week we shipped a Hongbao application... and we will do a lot more of these activations over the next few months! Please stay tuned!
