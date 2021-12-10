import React, { useContext, useState, useEffect } from 'react'
import Head from 'next/head'
import styled from 'styled-components'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'
import Account from '../interface/Account'
import Layout from '../interface/Layout'
import Loading from '../interface/Loading'
import { Heading, Instructions } from '../interface/FinishSignup'
import { pageTitle } from '../../constants'
import { ConfigContext } from '../../utils/withConfig'

interface CloneContentProps {
  query: any
}

export const CloneContent = ({ query }: CloneContentProps) => {
  const { account, network } = useContext(AuthenticationContext)
  const config: any = useContext(ConfigContext)
  const [error, setError] = useState('')
  const [isCloning, setIsCloning] = useState(false)
  const [lockMigration, setLockMigration] = useState({
    success: false,
    logs: [],
  })
  const lockAddress = query.locks

  const cloneLock = async (event: any) => {
    event.preventDefault()
    setIsCloning(true)
    if (typeof fetch !== 'undefined' && network) {
      try {
        const response = await fetch(
          `${config.networks[network].locksmith}/lock/${lockAddress}/migrate?signee=${account}`,
          { method: 'POST' }
        )
        setLockMigration(await response.json())
        setIsCloning(false)
      } catch (error: any) {
        console.log(error)
        setError('Fail to clone. Please refresh and try again.')
        setIsCloning(false)
      }
    } else {
      setError('Network not set. aborting.')
    }
    return false
  }

  const fetchLockMigration = async () => {
    if (network) {
      try {
        const response = await fetch(
          `${config.networks[network].locksmith}/lock/${lockAddress}/migrate`,
          { method: 'GET' }
        )
        setLockMigration(await response.json())
      } catch (error: any) {
        console.log(error)
      }
    }
  }

  useEffect(() => {
    const url = new window.URL(window.location.href)
    if (!url.searchParams.get('locks')) {
      setError('Missing lock param!')
    }
    // fetch lock
    fetchLockMigration().catch(console.error)
  })

  return (
    <Layout title="Clone Lock">
      <Head>
        <title>{pageTitle('Clone Lock')}</title>
      </Head>
      <Account />
      <Heading>Clone your Lock</Heading>
      <Instructions>
        We had to redeploy Unlock{' '}
        {network && `on ${config.networks[network].name}`}. We strongly
        recommend that you clone your lock in order to use that new version of
        Unlock.
      </Instructions>
      <p>
        Note: An identical lock with a new address will be created, with all
        members in an identical state. all existing content.{' '}
        <b>
          Once the migration has suceeded, please update your system with the
        </b>
      </p>
      {error && <p>{error}</p>}
      {!account && <p>Please authentificate to clone this lock</p>}
      {account && !error && !Object.keys(lockMigration).length && (
        <p>
          <Button onClick={cloneLock}>Clone your lock now</Button>
        </p>
      )}
      {isCloning && <Loading />}
      {Object.keys(lockMigration).length && !lockMigration.success && (
        <div>
          <h2>Migration ongoing...</h2>
          <p>
            <pre>{lockMigration.logs}</pre>
          </p>
          <p>
            If you experience any problem during the migration, please reach our
            for us at{' '}
            <a href="mailto:hello@unlock-protocol.com">
              hello@unlock-protocol.com
            </a>{' '}
            or on our Discord developer channel.
          </p>
        </div>
      )}
      {Object.keys(lockMigration).length && lockMigration.success && (
        <p>
          Migration successful! The new lock address is
          <em>lockMigration.newAddress</em>
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
export default CloneContent
