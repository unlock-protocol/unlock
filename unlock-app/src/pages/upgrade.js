import React from 'react'
import { useRouter } from 'next/router'

import UpgradeContent from '../components/content/UpgradeContent'

const Upgrades = () => {
  const { query } = useRouter()
  return <UpgradeContent query={query} />
}

export default Upgrades
