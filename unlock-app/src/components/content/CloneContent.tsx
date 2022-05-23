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
import { ToastHelper } from '../helpers/toast.helper'

interface CloneContentProps {
  query: any
}

export const CloneContent = ({ query }: CloneContentProps) => {
  const { account, network } = useContext(AuthenticationContext)
  const config: any = useContext(ConfigContext)
  const [isCloning, setIsCloning] = useState(false)
  const [lockMigration, setLockMigration] = useState({
    existing: false,
    migrated: false,
    logs: [],
    newLockAddress: null,
  })
  const lockAddress = query.locks

  const cloneLock = async (event: any) => {
    event.preventDefault()
    setIsCloning(true)
    if (typeof fetch !== 'undefined' && network) {
      try {
        const response = await fetch(
          `${config.networks[network].locksmith}/lock/${lockAddress}/migrate?signee=${account}&chainId=${network}`,
          { method: 'POST' }
        )
        if (response.status === 200) {
          setLockMigration({ ...lockMigration, existing: true })
          // re-fetch result every 3s
          // setInterval(() => fetchLockMigration(), 3000)
        }
      } catch (error: any) {
        console.log(error)
        ToastHelper.error('Fail to clone. Please refresh and try again.')
        setIsCloning(false)
      }
    } else {
      ToastHelper.error('Network not set. aborting.')
    }
    return false
  }

  const fetchLockMigration = async () => {
    if (network) {
      try {
        const response = await fetch(
          `${config.networks[network].locksmith}/lock/${lockAddress}/migrate?chainId=${network}`,
          { method: 'GET' }
        )
        if (response.status === 200) {
          const existingMigration = await response.json()
          setLockMigration({ existing: true, ...existingMigration })
        } else if (response.status === 404) {
          // no migration
        }
      } catch (error: any) {
        console.log(error)
      }
    }
  }

  useEffect(() => {
    const url = new window.URL(window.location.href)
    if (!url.searchParams.get('locks')) {
      ToastHelper.error('Missing lock param!')
    }
    // fetch lock
    if (!lockMigration.existing) {
      fetchLockMigration().catch(console.error)
    }
  })

  const existing = Object.keys(lockMigration).length && lockMigration.existing
  const success = Object.keys(lockMigration).length && lockMigration.migrated

  return (
    <Layout title="Clone Lock">
      <Head>
        <title>{pageTitle('Clone Lock')}</title>
      </Head>
      <Account />
      <Heading>Clone your Lock</Heading>
      {(!Object.keys(lockMigration).length || !success) && (
        <div>
          <Instructions>
            We had to redeploy Unlock{' '}
            {network && `on ${config.networks[network].name}`}. We strongly
            recommend that you clone your lock in order to use that new version
            of Unlock.
          </Instructions>
          <p>
            Note: An identical lock with a new address will be created, with all
            members in an identical state. <br />
          </p>
        </div>
      )}
      {!account && <p>Please authentificate to clone this lock</p>}
      {account && !existing && (
        <p>
          <Button onClick={cloneLock}>Clone your lock now</Button>
        </p>
      )}
      {isCloning && <Loading />}
      {existing && !success && (
        <h2>
          Migration ongoing...
          <small>Please refresh the page for status update.</small>
        </h2>
      )}
      {existing && (
        <div>
          <pre>
            <code>{lockMigration.logs}</code>
          </pre>
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
      {success && (
        <div>
          <h4>
            Migration successful! <br /> The new lock address is{' '}
            <em>{lockMigration.newLockAddress}</em>
          </h4>
          <p>Please update your system with the new lock address.</p>
        </div>
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
