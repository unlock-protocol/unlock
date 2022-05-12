/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
import React, { useState } from 'react'
import Head from 'next/head'
import styled from 'styled-components'
import { Button, Modal, Input } from '@unlock-protocol/ui'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import { VerifiersList } from '../interface/verifiers/VerifiersList'

const styling = {
  sectionWrapper: 'text-left mx-2 my-3',
  sectionTitle: 'text-lg text-black font-bold',
  sectionDesctiption: 'text-sm text-black-600 text-align-text',
  input: 'mt-3 mb-4',
  actions: 'flex mt-5 justify-end',
  button: 'ml-2',
}
export const VerifiersContent = () => {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [verifierAddress, setVerifierAddress] = useState('')

  const onAddVerifier = () => {
    setIsAddOpen(true)
  }

  const onVerifierAddressChange = (e: any) => {
    const value = e.target.value ?? ''
    setVerifierAddress(value)
  }
  return (
    <Layout title="Verifiers">
      <Head>
        <title>{pageTitle('Verifiers')}</title>
      </Head>

      <VerifierContent>
        <Header>
          <span>A list for all verifiers for your event</span>
          <Button>Add verifier</Button>
        </Header>
        <VerifiersList />
      </VerifierContent>

      <Modal isOpen={isAddOpen} setIsOpen={onAddVerifier}>
        <div className={styling.sectionWrapper}>
          <h3 className={styling.sectionTitle}>Add verifier</h3>
          <span className={styling.sectionDesctiption}>
            Input the wallet address of the user you wamt to give permission
          </span>
          <Input
            placeholder="0x.."
            className={styling.input}
            value={verifierAddress}
            onChange={onVerifierAddressChange}
          />
          <div className={styling.actions}>
            <Button variant="secondary">Close</Button>
            <Button className={styling.button}>Add address</Button>
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
