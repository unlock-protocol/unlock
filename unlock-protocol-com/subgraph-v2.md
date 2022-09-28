---
title: Subgraph upgrade
subtitle: An upgraded version of the subgraph is now available
publishedDate: Sep 29 2022
authorName: Clement Renaud
description: An upgraded version of the subgraph which indexes onchain data is now available, with simpler data structure and more robust parsing.
---

## Storing and retrieving data from
the chains 

As the number of features grow, keeping track of changes in a contract can become tricky. The transaction data itself only hold basic data like the changes in balances of native tokens of the sender and receiver. Changes in the state of the contract storage itself is recorded using an event that is emitted by the transaction. 

For instance, a tx that changes the ownership of an NFT will emit a ‘Transfer’ event with the id of the token, as well as the addresses of the previous and new owners.

While the information is recorded onchain using these events, querying it is not very practical. For instance, to know the number of times a token has been transferred hundreds of time, you will have to replay all the ‘Trabsfer’ events attached to the contract, filter only the ones relevant to the id of your token and finally count them. 

## What is the graph ?

To facilitate the query of transactions data, the graph collect all the events in your contract and put them in the database so it can be easily used. Note that this is a private service, operated by a company called XXX that operates the server. They are currently moving to a more decentralized governance, using their own token etc.

Unlock offers several web services to facilitate the use of the core protocol (payments checkout, etc). These relies heavily on querying data from the chain to display various kind of information related to locks, keys, ownerships, etc. For each chain that supports the protocol there is an instance of the graph indexing and formatting the chain data so it can be easily used on our frontends. It is public and can be queried using graphql to retrieved data about a specific lock or key. 

## Unlock subgraph V2 

We are now releasing a second version of the subgraph that contains better indexing format. It also comes with extensive unit and integration testing, which will allow us to adapt it easily to possible updates in the protocol without breaking anything. The schema has been simplified, the logic is faster, and now support contract upgrades natively. 

To query the subgraph, you can use a simple JSON request or a graphql client. Please refer to [our docs]() for most extensive explanation about how to use it.

To date, the following subgraphs are available:

[ here goes the list of supported networks with links] 


