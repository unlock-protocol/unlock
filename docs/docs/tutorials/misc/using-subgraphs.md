---
title: Using Subgraphs
description: >-
  This tutorial explains how to utilize a subgraph to efficiently retrieve large datasets from smart contracts.
---

# Using Subgraphs

RPC endpoints can only return one piece of information at a time, such as the name of a specific lock or the expiration date of a key. Retrieving multiple attributes or a list of objects through RPC calls is usually costly and inefficient. This is where subgraphs come in.

Subgraphs provide structured and indexed "views" of blockchain data, making it easier to retrieve large amounts of information quickly. They use the widely adopted [GraphQL](https://graphql.org) API query language, allowing developers to construct flexible and efficient queries.

In this tutorial, we will create a function that utilizes Unlock's subgraphs to fetch a list of locks managed by a given address. A similar approach is used to load user locks in [our dashboard](https://app.unlock-protocol.com/dashboard).

## Constructing the Query

The first step is to create a GraphQL query. The Graph offers a _Playground_ tool that helps developers build and test queries. Below is an example using the xDAI subgraph (all networks follow the same schema).

![Subgraph Explorer](/img/developers/subgraph-explorer.png)

The left panel provides a query builder to customize requests, while the right panel assists with schema inspection and query auto-completion.

To retrieve locks managed by a specific address, we can use the following query:

```graphql
{
  locks(orderBy: createdAtBlock, orderDirection: desc, where: {
    lockManagers_contains: ["0xDD8e2548da5A992A63aE5520C6bC92c37a2Bcc44"]
  }) {
    id
    address
    name
    lockManagers
    price
    tokenAddress
    totalSupply
    expirationDuration
    maxNumberOfKeys
    version
  }
}
```

This query fetches locks sorted in descending order by creation block, ensuring the most recent ones appear first. It filters results where the `lockManagers` field contains the specified address. The retrieved data includes lock details such as address, name, price, token type (if ERC-20), duration, total supply, and version.

## Sending the Request

GraphQL libraries exist for various programming languages. Here, we use JavaScript's built-in `fetch` function, available in both browser environments and Node.js (starting from version 18, where `fetch` is natively supported).

```javascript
const query = `query Locks($owner: String!) {
  locks(orderBy: createdAtBlock, orderDirection: desc, where: {
    lockManagers_contains: [$owner]
  }) {
    id
    address
    name
    lockManagers
    price
    tokenAddress
    expirationDuration
    version
  }
}`;

const variables = { owner: userAddress };

const result = await fetch(
  "https://api.thegraph.com/subgraphs/name/unlock-protocol/unlock",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  }
).then((r) => r.json());
```

The `result` variable will contain the retrieved data in a structured JSON format. Specifically, the response includes a `data` object with a `locks` array containing relevant lock details.

```json
{
  "data": {
    "locks": [
      {
        "id": "0x3ba39a6185ac5d35927e6166255bebee9f61112d",
        "address": "0x3ba39a6185ac5d35927e6166255bebee9f61112d",
        "name": "First Goerli Lock",
        "lockManagers": ["0xdd8e2548da5a992a63ae5520c6bc92c37a2bcc44"],
        "price": "70000000000000000",
        "tokenAddress": "0x0000000000000000000000000000000000000000",
        "expirationDuration": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
        "version": "10"
      },
      {
        "id": "0x874161a65ab3341b958c815cc933b9868ac4790e",
        "address": "0x874161a65ab3341b958c815cc933b9868ac4790e",
        "name": "Second Goerli Lock",
        "lockManagers": ["0xdd8e2548da5a992a63ae5520c6bc92c37a2bcc44"],
        "price": "10000000000000000",
        "tokenAddress": "0x0000000000000000000000000000000000000000",
        "expirationDuration": "2592000",
        "version": "10"
      }
    ]
  }
}
```

## Next Steps

GraphQL provides a powerful way to query blockchain data, enabling developers to build efficient and flexible web3 applications. By leveraging subgraphs, you can easily retrieve structured blockchain data and integrate it into your projects.