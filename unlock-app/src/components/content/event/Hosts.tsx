import { init, useQuery } from '@airstack/airstack-react'

interface HostsProps {
  organizers?: string[]
}

export const Hosts = ({ organizers }: HostsProps) => {
  console.log(organizers)
  const { data, loading, error } = useQuery(
    `query MyQuery($address: Identity!) {
      ${organizers?.map((organizer, i) => {
        return `Organizer${i}:Wallet(
          input: {identity: $address${i}, blockchain: ethereum}
        ) {
          primaryDomain {
            name
          }
          socials(input: {filter: {dappName: {_in: [lens, farcaster]}}}) {
            dappName
            profileName
            profileImageContentValue {
              image {
                original
              }
            }
            profileUrl
          }
        }`
      })}`,
    {
      address: '0x9d3ea9e9adde71141f4534dB3b9B80dF3D03Ee5f',
    }
  )

  console.log({ data, error })

  if (loading) {
    return <p>Loading...</p>
  }

  if (error) {
    return <p>Error: {error.message}</p>
  }

  return <p>HAHAH!</p>
}

export default Hosts
