import { createContext, useContext } from 'react'

interface MembershipState {
  isMember: string
  becomeMember(): unknown | Promise<unknown>
}

export const MembershipContext = createContext<MembershipState>({
  isMember: 'pending',
  becomeMember: () => {},
})

export const { Provider, Consumer } = MembershipContext

export function useMembership() {
  const membership = useContext(MembershipContext)
  return membership
}
