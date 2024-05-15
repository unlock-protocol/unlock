import { useQuery } from '@tanstack/react-query'

interface MembershipOptions {
  account: string | undefined
  paywallConfig: any
  web3Service: any
}

export const useMembership = ({
  account,
  paywallConfig,
  web3Service,
}: MembershipOptions) => {
  const query = useQuery(
    ['memberships', account, JSON.stringify(paywallConfig)],
    async () => {
      const memberships = await Promise.all(
        Object.entries(paywallConfig.locks).map(
          async ([lockAddress, props]) => {
            // @ts-expect-error 'props' is of type 'unknown'
            const lockNetwork = props.network || paywallConfig.network || 1
            const [member, total] = await Promise.all([
              web3Service.getHasValidKey(lockAddress, account!, lockNetwork),
              web3Service.totalKeys(lockAddress, account!, lockNetwork),
            ])
            // if not member but total is above 0
            const expired = !member && total > 0
            return {
              lock: lockAddress,
              expired,
              member,
              network: lockNetwork,
            }
          }
        )
      )
      return memberships
    },
    {
      enabled: !!account,
    }
  )
  return query
}
