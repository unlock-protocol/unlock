import React, { useContext, useState } from 'react'
import Head from 'next/head'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'
import { useLocks } from '../../hooks/useLocks'
import Account from '../interface/Account'
import Layout from '../interface/Layout'
import Loading from '../interface/Loading'
import { pageTitle } from '../../constants'
import { ConfigContext } from '../../utils/withConfig'

interface UpgradeContentProps {
  query: any
}

const upgradeLock = async (event, lockUpgradeURL) => {
  event.preventDefault()
  console.log(lockUpgradeURL)
  if (typeof fetch !== 'undefined') {
    const response = await fetch(lockUpgradeURL, { method: 'POST' })
    console.log(await response.json())
  }
  return false
}

const ButtonToUpgradeLock = function ({ lockAddress }) {
  console.log(lockAddress)
  const { account, network } = useContext(AuthenticationContext)
  const { loading, locks, addLock, error } = useLocks(account)
  const config: any = useContext(ConfigContext)
  const lock = locks.find((d) => d.address === lockAddress)
  const lockUpgradeURL = `${config.networks[network].locksmith}/upgrade/${lockAddress}`
  return (
    <p>
      {loading ? (
        <Loading />
      ) : (
        <a
          href={lockUpgradeURL}
          onClick={(event) => upgradeLock(event, lockUpgradeURL)}
        >
          Upgrade
        </a>
      )}
    </p>
  )
}

export const UpgradeContent = function ({ query }: UpgradeContentProps) {
  const { account, network } = useContext(AuthenticationContext)

  return (
    <Layout title="Upgrade Lock">
      <Head>
        <title>{pageTitle('Upgrade Lock')}</title>
      </Head>
      <Account />
      {account && network ? (
        <p>
          Hello lock <ButtonToUpgradeLock lockAddress={query.locks} />
        </p>
      ) : (
        <p>Please authentificate to upgrade this lock</p>
      )}
    </Layout>
  )
}
export default UpgradeContent
