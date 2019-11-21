import { gql } from 'apollo-boost'

export default function locksByOwnerQuery() {
  return gql`
    query Locks($owner: String!) {
      locks(where: { owner: $owner }) {
        id
        address
        name
        expirationDuration
        totalSupply
        maxNumberOfKeys
        owner
      }
    }
  `
}
