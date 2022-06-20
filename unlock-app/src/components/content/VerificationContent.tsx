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
  let hexData
  let sig

  if (typeof query.data === 'string' && typeof query.sig === 'string') {
    data = JSON.parse(decodeURIComponent(query.data))
    hexData = `0x${Buffer.from(
      decodeURIComponent(query.data),
      'utf-8'
    ).toString('hex')}`
    sig = query.sig
  }

  if (!data || !sig || !hexData) {
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
        <VerificationStatus data={data} sig={sig} hexData={hexData} />
      </LocksContext.Provider>
    </Layout>
  )
}

export default VerificationContent
