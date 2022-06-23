import React, { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import VerificationStatus from '../interface/VerificationStatus'
import { pageTitle } from '../../constants'
import Authenticate from '../interface/Authenticate'
import Loading from '../interface/Loading'
import LocksContext from '../../contexts/LocksContext'

export const VerificationContent = () => {
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
      <Authenticate optional>
        <Account />
        <LocksContext.Provider
          value={{
            locks,
            addLock,
          }}
        >
          <VerificationStatus data={data} sig={sig} hexData={hexData} />
        </LocksContext.Provider>
      </Authenticate>
    </Layout>
  )
}

export default VerificationContent
