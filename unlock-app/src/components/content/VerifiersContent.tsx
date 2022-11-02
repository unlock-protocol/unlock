/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
import React, { useContext, useEffect, useState } from 'react'
import Head from 'next/head'
import { Button, Modal, Input } from '@unlock-protocol/ui'
import { pageTitle } from '../../constants'
import { VerifiersList } from '../interface/verifiers/VerifiersList'
import { getAddressForName } from '../../hooks/useEns'
import { ToastHelper } from '../helpers/toast.helper'
import { useStorageService } from '../../utils/withStorageService'
import { LocksByNetwork } from '../creator/lock/LocksByNetwork'
import { Lock } from '@unlock-protocol/types'
import AuthenticationContext from '~/contexts/AuthenticationContext'
import { useRouter } from 'next/router'
import { AppLayout } from '../interface/layouts/AppLayout'

const styling = {
  sectionWrapper: 'text-left',
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
  const { account } = useContext(AuthenticationContext)
  const [addVerifierModalOpen, setAddVerifierModalOpen] = useState(false)
  const [verifierAddress, setVerifierAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifiers, setVerifiers] = useState<any[]>([])
  const [lockAddress, setLockAddress] = useState<string | null>(null)
  const [network, setNetwork] = useState<number | null>(null)

  const storageService = useStorageService()
  const router = useRouter()

  const setParams = ({
    lock,
    network,
  }: {
    lock: string
    network: string | number
  }) => {
    setLockAddress(lock || null)
    setNetwork(parseInt(`${network}`, 10) || null)
  }

  useEffect(() => {
    const { lock, network } = query
    setParams({
      lock,
      network,
    })
  }, [query])

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
        const options = {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
        await storageService
          .getEndpoint(
            `/v2/api/verifier/${network}/${lockAddress}/${resolvedAddress}`,
            options,
            true /* withAuth */
          )
          .then((res: any) => {
            if (res.message) {
              ToastHelper.error(res.message)
            } else {
              ToastHelper.success('Verifier added to list')
              getVerifierList() // get updated list with last item added
              setAddVerifierModalOpen(false)
            }
          })

        setLoading(false)
      } else {
        ToastHelper.error('Verified address is not a valid Ethereum address.')
        setLoading(false)
      }
    } catch (err: any) {
      setLoading(false)
      console.error(err)
      ToastHelper.error(
        err?.error ??
          'There was a problem adding the verifier address, please re-load and try again'
      )
    }
  }

  const getVerifierList = async () => {
    try {
      const options = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
      await storageService
        .getEndpoint(
          `/v2/api/verifier/list/${network}/${lockAddress}`,
          options,
          true /* withAuth */
        )
        .then((res: any) => {
          if (res.message) {
            ToastHelper.error(res.message)
          } else {
            setVerifiers(res?.results)
          }
        })
    } catch (err: any) {
      setLoading(false)
      console.error(err)
      ToastHelper.error(
        err?.error ??
          'We could not load the list of verifiers for your lock. Please reload to to try again.'
      )
    }
  }

  const onLockChange = (lock: Lock, network: number) => {
    setParams({
      lock: lock.address,
      network,
    })
  }

  const withoutParams = !lockAddress || !network
  return (
    <AppLayout title="Verifiers">
      <Head>
        <title>{pageTitle('Verifiers')}</title>
      </Head>

      <section className="flex flex-col items-start w-full">
        <section className="flex items-center justify-between w-full">
          <span>A list for all verifiers for your event</span>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push('verifiers')}
              disabled={withoutParams}
            >
              Change Lock
            </Button>
            <Button disabled={withoutParams} onClick={onAddVerifier}>
              Add verifier
            </Button>
          </div>
        </section>

        {withoutParams ? (
          <LocksByNetwork onChange={onLockChange} owner={account!} />
        ) : (
          <VerifiersList
            lockAddress={lockAddress}
            getVerifierList={getVerifierList}
            verifiers={verifiers}
            setVerifiers={setVerifiers}
          />
        )}
      </section>

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
    </AppLayout>
  )
}

export default VerifiersContent
