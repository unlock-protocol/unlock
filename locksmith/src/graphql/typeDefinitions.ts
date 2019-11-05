import { gql } from 'apollo-server-express'

// eslint-disable-next-line import/prefer-default-export
export const typeDefs = gql`
  type Lock {
    id: ID
    address: String
    name: String
    tokenAddress: String
    price: String
    expirationDuration: Int
    totalSupply: Int
    maxNumberOfKey: Int
  }

  type KeyPurchase {
    id: ID!
    lock: String!
    purchaser: String!
    price: String!
    timestamp: String!
    tokenAddress: String!
  }

  type Query {
    locks: [Lock]
    keyPurchases: [KeyPurchase!]
  }
`
