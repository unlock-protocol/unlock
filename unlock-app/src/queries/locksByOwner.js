import { gql } from 'apollo-boost'

export default function locksByOwnerQuery() {
  return gql`
    query Locks($owner: String!) {
      locks(
        where: { owner: $owner }
        orderBy: creationBlock
        orderDirection: desc
      ) {
        id
        address
        name
        expirationDuration
        totalSupply
        maxNumberOfKeys
        owner
        creationBlock
      }
    }
  `
}
