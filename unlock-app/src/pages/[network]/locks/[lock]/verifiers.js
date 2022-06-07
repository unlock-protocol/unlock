import React from 'react'
import { useRouter } from 'next/router'
import VerifiersContent from '../../../../components/content/VerifiersContent'

const Verifiers = () => {
  const { query } = useRouter()
  return <VerifiersContent query={query} />
}

export default Verifiers
