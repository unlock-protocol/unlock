---
title: Queries
description: Example of queries.
---



# Querying

Below are some sample queries you can use to gather information from the Unlock contracts.

You can build your own queries using a [GraphQL Explorer](https://graphiql-online.com/graphiql) and enter your endpoint to limit the data to exactly what you need.

# Latest Key Purchase

```graphql
{
  keyPurchases(orderBy: timestamp, orderDirection: desc, first: 5) {
    lock
    purchaser
  }
}
```

# Listing Locks

```graphql
{
  locks {
    address
    name
    tokenAddress
  }
}
```

# Listing Locks by Manager

```graphql
{
  lockManagers(
    where: { address: "0x33ab07dF7f09e793dDD1E9A25b079989a557119A" }
  ) {
    lock {
      address
      name
      expirationDuration
      creationBlock
      tokenAddress
      price
    }
  }
}
```
