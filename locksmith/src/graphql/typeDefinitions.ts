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
    key(id: ID!): Key
    keys: [Key]
    locks: [Lock]
    keyPurchases: [KeyPurchase!]
  }

  type Attribute {
    trait_type: String!
    value: Int!
    display_type: String!
  }

  type Metadata {
    name: String!
    description: String!
    image: String!
    attributes: [Attribute]
  }

  type KeyHolder {
    id: ID!
    address: String!
  }

  type Key {
    id: ID!
    lock: Lock!
    keyId: String!
    owner: KeyHolder!
    expiration: Int!
    metadata: Metadata
  }
`
