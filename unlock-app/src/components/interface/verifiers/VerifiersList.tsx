import React, { useEffect, useState } from 'react'
import { HiOutlineTrash as TrashIcon } from 'react-icons/hi'
import { Button, Modal, Tooltip } from '@unlock-protocol/ui'
import { ethers } from 'ethers'
import { useAuth } from '../../../contexts/AuthenticationContext'
import { ToastHelper } from '../../helpers/toast.helper'
import Loading from '../Loading'
import { useWalletService } from '../../../utils/withWalletService'
import { useStorageService } from '~/utils/withStorageService'
import { addressMinify } from '~/utils/strings'

const styling = {
  sectionWrapper: 'text-left mx-2 my-3',
  sectionTitle: 'text-lg text-black font-bold',
  sectionDesctiption: 'text-sm text-black-600 text-align-text',
  address: 'text-indigo-700',
  actions: 'flex mt-5 justify-center',
  button: 'ml-2 flex',
  title: 'text-base font-medium text-black break-all	',
  description: 'text-sm font-normal text-gray-500',
  addressCard: 'text-sm	font-sm font-normal text-gray-600',
}
interface VerifiersListProsps {
  lockAddress: string
  getVerifierList: () => void
  verifiers: any[]
  setVerifiers: any
}
export const VerifiersList: React.FC<VerifiersListProsps> = ({
  lockAddress,
  getVerifierList,
  verifiers,
  setVerifiers,
}) => {
  const { network, account } = useAuth()
  const [selectedVerifier, setSelectedVerifier] = useState('')
  const [showDeleteVerifierModal, setShowDeleteVerifierModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [logged, setLogged] = useState(false)
  const storageService = useStorageService()
  const walletService = useWalletService()

  const setDefaults = () => {
    setShowDeleteVerifierModal(false)
    setSelectedVerifier('')
    setLoading(false)
  }

  useEffect(() => {
    loginAndGetList()
  }, [])

  const loginAndGetList = async () => {
    try {
      await storageService.loginPrompt({
        walletService,
        address: account!,
        chainId: network!,
      })
      setLogged(true)
      setLoading(true)
      await getVerifierList()
      setLoading(false)
    } catch (err) {
      setLogged(false)
    }
  }

  const onConfirmDeleteVerifier = async () => {
    setLoading(true)
    const isValid = ethers.utils.isAddress(selectedVerifier)

    try {
      if (isValid) {
        const options = {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
        await storageService
          .getEndpoint(
            `/v2/api/verifier/${network}/${lockAddress}/${selectedVerifier}`,
            options,
            true /* withAuth */
          )
          .then((verifiers: any) => {
            ToastHelper.success('Verifier deleted from list')
            setVerifiers(verifiers?.results)
            setLoading(false)
          })
        setDefaults()
      } else {
        ToastHelper.error(
          'Recipient address is not valid, please check it again'
        )
        setLoading(false)
      }
    } catch (err: any) {
      setLoading(false)
      console.error(err)
      ToastHelper.error(
        err?.error ??
          'There was a problem adding verifier, please re-load and try again'
      )
    }
  }

  const onDeleteVerifier = (verifierAddress: string) => {
    if (!verifierAddress) return
    setSelectedVerifier(verifierAddress)
    setShowDeleteVerifierModal(true)
  }

  if (loading) {
    return (
      <div className="flex w-full justify-center">
        <Loading />
      </div>
    )
  }

  if (!logged && !loading) {
    return (
      <>
        <span>Sign message in your wallet to show verifiers list.</span>
      </>
    )
  }
  return (
    <>
      <div className="flex flex-col w-full gap-2 mt-[1rem]">
        {verifiers?.map((verifier: any, index: number) => {
          const key = `${verifier?.address}-${index}`
          const createdAt = verifier?.createdAt
            ? new Date(verifier?.createdAt).toLocaleString()
            : '-'
          const updatedAt = verifier?.updatedAt
            ? new Date(verifier?.updatedAt).toLocaleString()
            : '-'
          return (
            <div
              className="flex justify-between border-2 rounded-lg py-4 px-10 hover:shadow-sm bg-white"
              key={key}
            >
              <div className="grid gap-2 justify-between items-center grid-cols-4 mb-2 w-full">
                <div className="col-span-full	flex flex-col md:col-span-1">
                  <span className={styling.description}>Address</span>
                  <span className={styling.title}>
                    {addressMinify(verifier?.address)}
                  </span>
                </div>
                <div className="col-span-full	flex flex-col md:col-span-1">
                  <span className={styling.description}>Created at</span>
                  <span className={styling.title}>{createdAt ?? '-'}</span>
                </div>
                <div className="col-span-full	flex flex-col md:col-span-1">
                  <span className={styling.description}>Update at</span>
                  <span className={styling.title}>{updatedAt ?? '-'}</span>
                </div>
                <div className="flex col-span-full	md:col-span-1">
                  <Tooltip tip="Remove verifier" label="Remove verifier">
                    <Button className="ml-auto">
                      <TrashIcon
                        onClick={() => onDeleteVerifier(verifier?.address)}
                      />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Modal
        isOpen={showDeleteVerifierModal}
        setIsOpen={() => setShowDeleteVerifierModal(true)}
      >
        <div className={styling.sectionWrapper}>
          <h3 className={styling.sectionTitle}>Remove verifier</h3>
          <span className={styling.sectionDesctiption}>
            You are deleting{' '}
            <i className={styling.address}>{selectedVerifier}</i> from verifier
            list
          </span>
          <div className={styling.actions}>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteVerifierModal(false)}
              disabled={loading}
            >
              Abort
            </Button>
            <Button
              className={styling.button}
              onClick={onConfirmDeleteVerifier}
              disabled={loading}
            >
              <span className="flex">
                <span className="mx-2">Confirm</span>
                {loading && <Loading size={20} />}
              </span>
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
