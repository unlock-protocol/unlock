import React from 'react'
import { useRouter } from 'next/router'

import CloneContent from '../components/content/CloneContent'

const Clone = () => {
  const { query } = useRouter()
  return <CloneContent query={query} />
}

export default Clone
