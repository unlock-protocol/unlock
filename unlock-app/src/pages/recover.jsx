import React from 'react'
import { useRouter } from 'next/router'
import RecoverContent from '../components/content/RecoverContent'

const Recover = () => {
  const { query } = useRouter()
  return <RecoverContent query={query} />
}

export default Recover
