import React, { useContext, useState, useEffect } from 'react'
import Head from 'next/head'
import styled from 'styled-components'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'
import Account from '../interface/Account'
import Layout from '../interface/Layout'
import { Heading, Instructions } from '../interface/FinishSignup'
import { pageTitle } from '../../constants'
import { ConfigContext } from '../../utils/withConfig'

interface UpgradeContentProps {
  query: any
}

export const UpgradeContent = ({ query }: UpgradeContentProps) => {
  const { account, network } = useContext(AuthenticationContext)
  const config: any = useContext(ConfigContext)
  const [error, setError] = useState('')
  const lockAddress = query.locks

  const upgradeLock = async (event: any) => {
    event.preventDefault()
    if (typeof fetch !== 'undefined') {
      try {
        const response = await fetch(
          `${config.networks[network].locksmith}/lock/${lockAddress}/migrate`,
          { method: 'POST' }
        )
        console.log(await response.json())
      } catch (error: any) {
        console.log(error)
        setError('Fail to upgrade. Please refresh and try again.')
      }
    }
    return false
  }

  useEffect(() => {
    const url = new window.URL(window.location.href)
    if (!url.searchParams.get('locks')) {
      setError('Missing lock param!')
    }
  })

  return (
    <Layout title="Upgrade Lock">
      <Head>
        <title>{pageTitle('Upgrade Lock')}</title>
      </Head>
      <Account />
      <Heading>Upgrade your Lock</Heading>
      <Instructions>
        A new version of Unlock is available. Please click below to upgrade your
        lock and fix existing security issues.
      </Instructions>
      <p>
        Note: An identical lock with a new address will be created, containing
        all existing content.{' '}
        <b>
          Once the migration has suceeded, please update your system with the
          new lock address.
        </b>
      </p>
      {error && <p>{error}</p>}
      {!account && <p>Please authentificate to upgrade this lock</p>}
      {account && !error && (
        <p>
          <Button onClick={upgradeLock}>Upgrade your lock now</Button>
        </p>
      )}
    </Layout>
  )
}

const Button = styled.button`
  cursor: pointer;
  border: 3px solid #d8d8d8;
  border-radius: 15px;
  font-size: 1.3em;
  background-color: transparent;
  display: block;
  padding: 10px 20px;
  color: rgb(106, 106, 106);
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
`
export default UpgradeContent
