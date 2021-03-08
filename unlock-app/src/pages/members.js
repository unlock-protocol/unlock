import React from 'react'
import { useRouter } from 'next/router'

import MembersContent from '../components/content/MembersContent'

const Members = () => {
  const { query } = useRouter()
  return <MembersContent query={query} />
}

export default Members
