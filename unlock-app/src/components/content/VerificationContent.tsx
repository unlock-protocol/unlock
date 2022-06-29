import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { pageTitle } from '../../constants'
import LocksContext from '../../contexts/LocksContext'
import Account from '../interface/Account'
import Layout from '../interface/Layout'
import Loading from '../interface/Loading'
import VerificationStatus from '../interface/VerificationStatus'

export const VerificationContent: React.FC<unknown> = () => {
  const { query } = useRouter()
  const [locks, setLocks] = useState({})
  let data
  let sig

  if (typeof query.data === 'string' && typeof query.sig === 'string') {
    data = decodeURIComponent(query.data)
    sig = query.sig
  }

  if (!data || !sig) {
    return <Loading />
  }

  const addLock = (lock: any) => {
    return setLocks({
      ...locks,
      [lock.address]: lock,
    })
  }

  return (
    <Layout title="Verification">
      <Head>
        <title>{pageTitle('Verification')}</title>
      </Head>
      <Account />
      <LocksContext.Provider
        value={{
          locks,
          addLock,
        }}
      >
        <VerificationStatus data={data} sig={sig} />
      </LocksContext.Provider>
    </Layout>
  )
}

export default VerificationContent
