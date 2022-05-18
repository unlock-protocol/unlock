/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
import React, { useContext, useState } from 'react'
import Head from 'next/head'
import styled from 'styled-components'
import { Button, Modal, Input } from '@unlock-protocol/ui'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import { VerifiersList } from '../interface/verifiers/VerifiersList'
import { getAddressForName } from '../../hooks/useEns'
import { ToastHelper } from '../helpers/toast.helper'
import AuthenticationContext from '../../contexts/AuthenticationContext'

const styling = {
  sectionWrapper: 'text-left mx-2 my-3',
  sectionTitle: 'text-lg text-black font-bold',
  sectionDesctiption: 'text-sm text-black-600 text-align-text',
  input: 'mt-3 mb-4',
  actions: 'flex mt-5 justify-end',
  button: 'ml-2',
}

interface VerifiersContentProps {
  query: any
}

export const VerifiersContent: React.FC<VerifiersContentProps> = ({
  query,
}) => {
  const [addVerifierModalOpen, setAddVerifierModalOpen] = useState(false)
  const [verifierAddress, setVerifierAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const lockAddress: string = query?.lockAddress ?? ''
  const { network } = useContext(AuthenticationContext)

  const onAddVerifier = () => {
    setVerifierAddress('')
    setAddVerifierModalOpen(true)
  }

  const onVerifierAddressChange = (e: any) => {
    const value = e.target.value ?? ''
    setVerifierAddress(value)
  }

  const onAddAddress = async () => {
    setLoading(true)
    const resolvedAddress = await getAddressForName(verifierAddress)
    try {
      if (resolvedAddress) {
        const addVerifierUrl = `/verifier/${network}/${lockAddress}/${resolvedAddress}`
        const requestOptions = {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        }
        await fetch(addVerifierUrl, requestOptions)
          .then((res) => res.json())
          .then(() => {
            ToastHelper.success('Verifier added to list')
          })
        setLoading(false)
      } else {
        ToastHelper.error('Verified address is not a valid Ethereum address.')
        setLoading(false)
      }
    } catch (err: any) {
      setLoading(false)
      ToastHelper.error(
        err?.error ??
          'There was a problem adding the verifier address, please re-load and try again'
      )
    }
  }

  return (
    <Layout title="Verifiers">
      <Head>
        <title>{pageTitle('Verifiers')}</title>
      </Head>

      <VerifierContent>
        <Header>
          <span>A list for all verifiers for your event</span>
          <Button onClick={onAddVerifier}>Add verifier</Button>
        </Header>
        <VerifiersList lockAddress={lockAddress} />
      </VerifierContent>

      <Modal isOpen={addVerifierModalOpen} setIsOpen={onAddVerifier}>
        <div className={styling.sectionWrapper}>
          <h3 className={styling.sectionTitle}>Add verifier</h3>
          <span className={styling.sectionDesctiption}>
            Enter the Ethereum address of the user you want to add as a
            Verifier.
          </span>
          <Input
            placeholder="0x..."
            className={styling.input}
            value={verifierAddress}
            onChange={onVerifierAddressChange}
          />
          <div className={styling.actions}>
            <Button
              variant="secondary"
              onClick={() => setAddVerifierModalOpen(false)}
              disabled={loading}
            >
              Close
            </Button>
            <Button
              className={styling.button}
              onClick={onAddAddress}
              disabled={loading}
            >
              Add address
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}

export default VerifiersContent

const Header = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`
const VerifierContent = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`
