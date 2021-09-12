import React from 'react'

export const MembershipContext = React.createContext({
  isMember: 'pending',
  becomeMember: () => {},
})

export default {
  MembershipContext,
}
