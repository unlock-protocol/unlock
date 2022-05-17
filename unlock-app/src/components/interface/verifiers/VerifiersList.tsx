import React, { useContext, useEffect, useState } from 'react'
import { HiOutlineTrash as TrashIcon } from 'react-icons/hi'
import { Button, Modal, Tooltip } from '@unlock-protocol/ui'
import { ethers } from 'ethers'
import AuthenticationContext from '../../../contexts/AuthenticationContext'
import { ToastHelper } from '../../helpers/toast.helper'
import Loading from '../Loading'
import { ConfigContext } from '../../../utils/withConfig'

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
}
export const VerifiersList: React.FC<VerifiersListProsps> = ({
  lockAddress,
}) => {
  const { network } = useContext(AuthenticationContext)
  const [selectedVerifier, setSelectedVerifier] = useState('')
  const [showDeleteVerifierModal, setShowDeleteVerifierModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifiers, setVerifiers] = useState<any[]>([])
  const config: any = useContext(ConfigContext)

  const setDefaults = () => {
    setShowDeleteVerifierModal(false)
    setSelectedVerifier('')
    setLoading(false)
  }

  useEffect(() => {
    getVerifierList()
  }, [])

  const getVerifierList = async () => {
    try {
      const addVerifierUrl = `${config.services.storage.host}/v2/api/verifier/${network}/${lockAddress}/${selectedVerifier}`
      const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
      await fetch(addVerifierUrl, requestOptions)
        .then((res) => res.json())
        .then((verifiers: any) => {
          setVerifiers(verifiers)
        })
    } catch (err: any) {
      setLoading(false)
      ToastHelper.error(
        err?.error ??
          'We could not load the list of verifiers for your lock. Please reload to to try again.'
      )
    }
  }
  const onConfirmDeleteVerifier = async () => {
    setLoading(true)
    const isValid = ethers.utils.isAddress(selectedVerifier)
    try {
      if (isValid) {
        const addVerifierUrl = `/verifier/${network}/${lockAddress}/${selectedVerifier}`
        const requestOptions = {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }
        await fetch(addVerifierUrl, requestOptions)
          .then((res) => res.json())
          .then(() => {
            ToastHelper.success('Verifier deleted from list')
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

  return (
    <>
      <table className="w-full mt-3">
        <thead>
          <tr>
            <th>Address</th>
            <th className="text-left">Created at</th>
            <th className="text-left">Verified at</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {verifiers?.map((verifier: any, index: number) => {
            const key = `${verifier?.address}-${index}`
            return (
              <tr key={key}>
                <td>{verifier?.address ?? '-'}</td>
                <td>{verifier?.createdAt ?? '-'}</td>
                <td>{verifier?.updatedAt ?? '-'}</td>
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
