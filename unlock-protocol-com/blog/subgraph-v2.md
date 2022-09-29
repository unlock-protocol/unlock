---
title: Unlock Protocol Subgraph Upgrade with The Graph
subTitle: An upgraded version of the subgraph is now available
publishedDate: September 29, 2022
authorName: Clement Renaud
description: An upgraded version of the subgraph which indexes onchain data is now available, with simpler data structure and more robust parsing.
image: /images/blog/thegraph-share.png
---

## Storing and retrieving data from chains 

As the number of features grows, keeping track of changes in a contract can become tricky. The transaction data itself only hold changes in balances of native tokens of the sender and receiver. Changes in the state of the contract storage are recorded using events emitted by the transaction. For instance, an ownership change of an NFT will emit a `Transfer` event containing the id of the token, as well as the addresses of the previous and new owners. 

While these events are recorded onchain, querying appears to not be very practical. To know the number of times a token has been transferred, you will have to replay all the `Transfer` events attached to the contract, filter only the ones for the relevant token and finally count them. 

## What is the graph ?

To facilitate the query of transactions data, [the graph](https://thegraph.com/docs/en/) collects all the events in your contract and put them in the database so it can be easily used. The [Graph Foundation](https://www.notion.so/The-Graph-Foundation-e822e66d7b614fdd899a647f5db51a68) provides tools and libraries to index, store and retrieve graph data.

To facilitate the use of our protocol, Unlock offers several web services (checkout, user dasboard,  etc) that use chain data to display info about locks and keys. The frontend queries rely on instances of the graph that are indexing and formatting transactions on each supported chain, called subgraphs. All subgraphs are public, and data about locks or keys can be retrieved using [graphql](https://graphql.org/) requests. 

## Unlock subgraph V2 

To continue upgrading existing services, we are now releasing a new version of the subgraph with better formatting and indexing. On the development side, we added extensive unit and integration testing, which will allow developers to more quickly adapt and update the protocol. The schema has been simplified and now natively support contract upgrades.

To query the subgraph, you can use a JSON request or a graphql client. Please refer to [our docs](https://docs.unlock-protocol.com/tutorials/misc/using-subgraphs/) for the most extensive explanation about how to use it.


