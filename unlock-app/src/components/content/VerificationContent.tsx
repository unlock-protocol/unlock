import React from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import VerificationStatus from '../interface/VerificationStatus'
import { pageTitle } from '../../constants'
import Authenticate from '../interface/Authenticate'
import { DefaultError } from '../creator/FatalError'

export const VerificationContent = () => {
  const { query } = useRouter()
  let data
  let hexData
  let sig

  if (typeof query.data === 'string' && typeof query.sig === 'string') {
    data = JSON.parse(decodeURIComponent(query.data))
    hexData = `0x${Buffer.from(
      decodeURIComponent(query.data),
      'utf-8'
    ).toString('hex')}`
    sig = Buffer.from(query.sig, 'base64').toString()
  }

  if (!data || !sig || !hexData) {
    return (
      <DefaultError
        illustration="/static/images/illustrations/error.svg"
        title="No Signature Data Found"
        critical
      >
        We couldn&apos;t find a signature payload in the URL. Please check that
        you scanned the correct QR code.
      </DefaultError>
    )
  }

  return (
    <Layout title="Verification">
      <Head>
        <title>{pageTitle('Verification')}</title>
      </Head>
      <Authenticate optional requiredNetwork={data && data.network}>
        <Account />
        <VerificationStatus data={data} sig={sig} hexData={hexData} />
      </Authenticate>
    </Layout>
  )
}

export default VerificationContent
