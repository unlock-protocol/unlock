import React, { useContext, useEffect, useState } from 'react'
import { HiOutlineTrash as TrashIcon } from 'react-icons/hi'
import { Button, Modal, Tooltip } from '@unlock-protocol/ui'
import { ethers } from 'ethers'
import AuthenticationContext from '../../../contexts/AuthenticationContext'
import { ToastHelper } from '../../helpers/toast.helper'
import Loading from '../Loading'
import { WalletServiceContext } from '../../../utils/withWalletService'
import { useStorageService } from '~/utils/withStorageService'

const styling = {
  sectionWrapper: 'text-left mx-2 my-3',
  sectionTitle: 'text-lg text-black font-bold',
  sectionDesctiption: 'text-sm text-black-600 text-align-text',
  address: 'text-indigo-700',
  actions: 'flex mt-5 justify-center',
  button: 'ml-2 flex',
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
  const { network, account } = useContext(AuthenticationContext)
  const [selectedVerifier, setSelectedVerifier] = useState('')
  const [showDeleteVerifierModal, setShowDeleteVerifierModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [logged, setLogged] = useState(false)
  const storageService = useStorageService()
  const walletService = useContext(WalletServiceContext)

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
      getVerifierList()
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

  if (!logged) {
    return (
      <>
        <span>Sign message in your wallet to show verifiers list.</span>
      </>
    )
  }
  return (
    <>
      <table className="w-full mt-3">
        <thead>
          <tr>
            <th>Address</th>
            <th className="text-left">Created at</th>
            <th className="text-left">Updated at</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {verifiers?.map((verifier: any, index: number) => {
            const key = `${verifier?.address}-${index}`
            const createdAt = verifier?.createdAt
              ? new Date(verifier?.createdAt).toLocaleString()
              : '-'
            const updatedAt = verifier?.updatedAt
              ? new Date(verifier?.updatedAt).toLocaleString()
              : '-'
            return (
              <tr key={key}>
                <td>{verifier?.address ?? '-'}</td>
                <td>{createdAt ?? '-'}</td>
                <td>{updatedAt ?? '-'}</td>
                <td>
                  <Tooltip tip="Remove verifier" label="Remove verifier">
                    <TrashIcon
                      className="mx-auto"
                      onClick={() => onDeleteVerifier(verifier?.address)}
                    />
                  </Tooltip>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

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
