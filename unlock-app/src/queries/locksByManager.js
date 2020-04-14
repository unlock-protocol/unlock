import { gql } from 'apollo-boost'

export default function locksByManagerQuery() {
  return gql`
    query Locks($owner: String!) {
      lockManagers(where: { address: $owner }) {
        lock(orderBy: creationBlock, orderDirection: desc) {
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
    }
  `
}

// query Locks($owner: String!) {
//   locks(
//     where: { manager: $owner }
//     orderBy: creationBlock
//     orderDirection: desc
//   ) {
//   }
// }
