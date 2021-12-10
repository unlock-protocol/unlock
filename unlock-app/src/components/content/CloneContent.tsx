import React, { useContext, useState, useEffect } from 'react'
import Head from 'next/head'
import styled from 'styled-components'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'
import Account from '../interface/Account'
import Layout from '../interface/Layout'
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
  const [lockMigrations, setLockMigrations] = useState({})
  const lockAddress = query.locks

  const cloneLock = async (event: any) => {
    event.preventDefault()
    if (typeof fetch !== 'undefined' && network) {
      try {
        const response = await fetch(
          `${config.networks[network].locksmith}/lock/${lockAddress}/migrate`,
          { method: 'POST' }
        )
        setLockMigrations(await response.json())
      } catch (error: any) {
        console.log(error)
        setError('Fail to clone. Please refresh and try again.')
      }
    } else {
      setError('Network not set. aborting.')
    }
    return false
  }

  const fetchLockMigrations = async () => {
    if (network) {
      try {
        const response = await fetch(
          `${config.networks[network].locksmith}/lock/${lockAddress}/migrate`,
          { method: 'GET' }
        )
        setLockMigrations(await response.json())
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
    fetchLockMigrations().catch(console.error)
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
      {account && !error && (
        <p>
          <Button onClick={cloneLock}>Clone your lock now</Button>
        </p>
      )}
      {lockMigrations && <p>{lockMigrations}</p>}
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
