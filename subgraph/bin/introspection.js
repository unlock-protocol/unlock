const path = require('path')
const fs = require('fs-extra')
const { buildSchema, getIntrospectionQuery, graphql } = require('graphql')

// from https://github.com/graphprotocol/graph-node/blob/88c727325726edfda41d3dabe9c03b77b0f6781e/graph/src/schema/meta.graphql#L4
const TheGraphMetaQL = `
# GraphQL core functionality
scalar Boolean
scalar ID
scalar Int
scalar Float
scalar String

directive @skip(if: Boolean!) on FIELD | FRAGMENT_SPREAD | INLINE_FRAGMENT
directive @include(if: Boolean!) on FIELD | FRAGMENT_SPREAD | INLINE_FRAGMENT

# The Graph extensions

"Marks the GraphQL type as indexable entity.  Each type that should be an entity is required to be annotated with this directive."
directive @entity on OBJECT

"Defined a Subgraph ID for an object type"
directive @subgraphId(id: String!) on OBJECT

"creates a virtual field on the entity that may be queried but cannot be set manually through the mappings API."
directive @derivedFrom(field: String!) on FIELD_DEFINITION

scalar BigDecimal
scalar Bytes
scalar BigInt

# The type names are purposely awkward to minimize the risk of them
# colliding with user-supplied types
"The type for the top-level _meta field"
type _Meta_ {
  """
  Information about a specific subgraph block. The hash of the block
  will be null if the _meta field has a block constraint that asks for
  a block number. It will be filled if the _meta field has no block constraint
  and therefore asks for the latest  block
  """
  block: _Block_!
  "The deployment ID"
  deployment: String!
  "If true, the subgraph encountered indexing errors at some past block"
  hasIndexingErrors: Boolean!
}

input BlockChangedFilter {
  number_gte: Int!
}

input Block_height {
  hash: Bytes
  number: Int
  number_gte: Int
}

type _Block_ {
  "The hash of the block"
  hash: Bytes
  "The block number"
  number: Int!
  "Integer representation of the timestamp stored in blocks for the chain" 
  timestamp: Int
}

enum _SubgraphErrorPolicy_ {
  "Data will be returned even if the subgraph has indexing errors"
  allow,

  "If the subgraph has indexing errors, data will be omitted. The default."
  deny
}


"Defines the order direction, either ascending or descending"
enum OrderDirection {
  asc
  desc
}

"dummy query"
type Query {
  _dummy: String
}
`

async function main() {
  const schemaFilePath = path.join(__dirname, '..', 'schema.graphql')
  console.log(schemaFilePath)
  const raw = `${TheGraphMetaQL} \n${await fs.readFile(schemaFilePath, 'utf8')}`
  const schema = await buildSchema(raw)
  // console.log(schema)
  console.log(typeof getIntrospectionQuery())
  // printIntrospectionSchema()
  const data = await graphql({
    schema,
    requestString: getIntrospectionQuery(),
  })
  console.log(data)
}

main()
  .then(() => console.log('ok'))
  .catch((err) => console.error(err))
