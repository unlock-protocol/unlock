import { gql } from 'apollo-server-express'

export const typeDefs = gql`
  input KeyHolderQuery {
    address: String!
  }

  input LocksQuery {
    owner: String
    address_in: [String]
  }

  type Lock {
    id: ID
    address: String
    name: String
    tokenAddress: String
    price: String
    expirationDuration: Int
    totalSupply: Int
    maxNumberOfKeys: String
    owner: String
    keys: [Key]
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
    keys(first: Int): [Key]
    locks(where: LocksQuery): [Lock]
    keyPurchases: [KeyPurchase!]
    keyHolders(where: KeyHolderQuery!): [KeyHolder]
    keysList(network: ID!): [Lock]
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
    keys: [Key]
  }

  type Key {
    id: ID!
    lock: Lock!
    keyId: String!
    owner: KeyHolder!
    expiration: Int!
    metadata: Metadata
    tokenURI: String
  }
`
