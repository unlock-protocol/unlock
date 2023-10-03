---
title: How to Build an Onchain Scavenger Hunt
subTitle: Our partners at Coinage launched the first onchain scavenger hunt.
authorName: Julien Genestoux
publishDate: October 3, 2023
description: Scavenger hunts are fun because they require players to find things… blockchains are good, because they bring transparency.
image: /images/blog/scavenger-hunt-onchain/coinage.png
---

Our partners at Coinage launched [the first onchain scavenger hunt](https://hunt.coinage.media)! You have 12 days to unlock 12 words and get a chance to win 5 ETH.

Scavenger hunts are fun because they require players to find things… blockchains are good, because they bring transparency. How could we build a scavenger hunt onchain?

In this post we’ll share the details of how we built one!

![onchain scavenger hunt](/images/blog/scavenger-hunt-onchain/coinage.png)

## The rules of the scavenger hunt

The rules are fairly simple:

- The NFTs can only be minted starting at noon ET every day. So it is only possible to mint day 2, 24 hours after the game starts, etc.
- A given user can only mint the NFT for day n, if they have previously minted day n-1, except of course for the first day!
- To mint the NFT for a day, the user must **know** the word of that day.

## The smart contracts

Unlock Protocol membership smart contracts are called “locks.” At the core they are “regular” NFT-minting smart contracts with a ton of extra features. For the scavenger hunt, there is one contract per day, and the NFTs (keys) they mint are free to claim (the user only has to pay for gas to mint an NFT), and these NFT do not expire. Finally there is an unlimited supply of these NFTs for each day as of course, we would want as many participants as possible.

The most useful feature for the scavenger hunt is the presence of “hooks.” A hook is a call to a function on an external contract, which lets developers changes the behavior of the lock contract, or change its parameters dynamically.

Each Lock includes multiple hooks, starting with one that is called when a user performs a `purchase`. There are in fact two hooks in that `purchase` function. The first one gets called to get the price that the user should pay and the second one is called once the purchase has completed to change any state.

For this scavenger hunt, this is in this hook that we are implementing most of the logic:

- First, the hook has a `start` timestamp and we store each of the 12 locks. So we know if the `purchase` function has been called too early 🙂
- Then, since we have each of the locks, it’s possible to verify for each of them that the user who’s getting the NFT has minted the previous day’s NFT.
- Finally, we leverage another key feature of the `purchase` function in Unlock Protocol: its ability to also receive an arbitrary `data` field. The Lock actually ignores it, but passes it to the Hook contract. And this is how we check that the word-of-the-day matches.

## Storing secrets on chain

We could not really store the secret word of the day onchain, because anyone could easily just look up said words in the contract (or in previous successful transactions) and submit their own transaction with it. However, it’s important to realize that we don’t need the user to submit the word itself, but a proof that they know the word. This “proof” could be something that they would be able to compute _only_ if they knew the word.

If you’ve done a bit of cryptography, this should quickly ring a bell: you want a signature generated from the “secret”, rather than the secret. The signature can prove an “origin”, without disclosing how to perform it. As a matter of fact, if you know the messages that was signed, the EVM provides the very useful `ecrecover` function who can tell you the signer of a message, based on that message and a signature.

So, what we need to store is _not_ the password, but just the “signer” generated from the password itself. And what each `purchase` transaction needs to include is not the password either, but a “signature”, by the signer, of a “known” message. In our case, we use the “recipient” of the NFT as the message.

So to summarize, here is the flow we use:

1. From the word entered by the user, we generate a private key.
2. Using that private key, we sign the address of the recipient.
3. We submit the signature as the `data` field in the `purchase` function. It is then passed down to the Hook from the Lock.
4. The Lock uses `ecrecover` on the `data` field, with the `recipient` and finds a signer. If the signer matches, the transaction succeeds… and if it does not match, the transaction fails!

Of course, it is critical that the secret word has a LOT of entropy, and that is what we recommended to the team at Coinage, because someone could quite easily run a [Dictionary Attack!](https://en.wikipedia.org/wiki/Dictionary_attack)

Using this technique, and with enough entropy, we can store “secrets” on chain and create a Scavenger Hunt! We’re now on Day 9 of the [Coinage Treasure Hunt](https://hunt.coinage.media/)! It is not too late to start playing for day the big prize on Day 12 :)
