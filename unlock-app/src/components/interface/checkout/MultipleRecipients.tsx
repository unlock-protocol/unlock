import React, { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { IoIosCloseCircle as CloseIcon } from 'react-icons/io'
import { FiEdit as EditIcon } from 'react-icons/fi'
import { Tooltip } from '@unlock-protocol/ui'
import { RecipientItem } from '../../../hooks/useMultipleRecipient'
import { MetadataInput } from '../../../unlockTypes'
import { ToastHelper } from '../../helpers/toast.helper'
import Loading from '../Loading'
import { Button } from './FormStyles'
import AuthenticationContext from '../../../contexts/AuthenticationContext'

export interface MultipleRecipientProps {
  recipients: RecipientItem[]
  minRecipients: number
  maxRecipients: number
  hasMinimumRecipients: boolean
  addRecipient: any
  loading: boolean
  fields: Array<MetadataInput & { value?: any }>
  submitBulkRecipients: () => Promise<boolean>
  onContinue: () => void
  removeRecipient: (index: number) => void
  withMetadata: boolean
}
export const MultipleRecipient: React.FC<MultipleRecipientProps> = ({
  recipients,
  maxRecipients,
  minRecipients,
  hasMinimumRecipients,
  addRecipient,
  loading,
  fields = [],
  submitBulkRecipients,
  onContinue,
  removeRecipient,
  withMetadata,
}) => {
  const { account } = useContext(AuthenticationContext)
  const [addNewRecipient, setNewRecipient] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [recipient, setRecipient] = useState<string>('')
  const { register, unregister, getValues, reset, trigger } = useForm()
  const [isLoading, setIsLoading] = useState(false)
  const [confirmCount, setConfirmCount] = useState(0)
  const [showMetadataList, setShowMetadataList] = useState<number[]>([])
  const haveRecipients = recipients?.length > 0

  const autofillAccountAddress = () => {
    if (haveRecipients) return
    if (!account) return

    setNewRecipient(true)
    setRecipient(account)
  }

  useEffect(() => {
    autofillAccountAddress()
  }, [])

  const updateRecipientList = async (updateIndex?: number) => {
    const formValid = await trigger()
    if (formValid) {
      const metadata = getValues()
      const valid = await addRecipient(recipient, metadata, updateIndex)
      if (valid) {
        resetStatus()
      }
    } else {
      ToastHelper.error('Please fill all required fields')
    }
  }

  const onSaveRecipient = () => {
    if (addNewRecipient) {
      updateRecipientList()
    }

    if (isEdit && editIndex !== null) {
      updateRecipientList(editIndex)
      Object.keys(getValues()).map((key) => {
        unregister(key)
      })
    }
  }

  const resetStatus = () => {
    setNewRecipient(false)
    setEditIndex(null)
    reset()
    setRecipient('')
  }

  const onSubmit = async () => {
    if (hasMinimumRecipients) {
      setIsLoading(true)
      setConfirmCount(confirmCount + 1)
      // send metadata only if forms contains some metadata
      if (withMetadata) {
        const valid = await submitBulkRecipients()
        if (valid) {
          onContinue()
        }
      } else {
        onContinue()
      }

      setIsLoading(false)
    } else {
      ToastHelper.error(
        `You need to add at least ${minRecipients} recipients to continue.`
      )
    }
  }

  const toggleAddRecipient = () => {
    if (recipients?.length < maxRecipients) {
      setNewRecipient(!addNewRecipient)
    } else {
      ToastHelper.error("You can't add more recipients")
    }
  }

  const onEditRecipient = (
    index: number,
    defaultMetadataValues: any,
    userAddress: string
  ) => {
    reset(defaultMetadataValues)
    setRecipient(userAddress)
    setEditIndex(index)
  }

  const onToggleMetadata = (index: number) => {
    if (showMetadataList?.includes(index)) {
      setShowMetadataList((prev) => prev.filter((item) => item !== index))
    } else {
      setShowMetadataList((prev) => [...prev, index])
    }
  }

  const isEdit = editIndex !== null
  const showForm = isEdit || addNewRecipient
  const showList = !addNewRecipient && !isEdit

  return (
    <form>
      <span className="text-sm block">
        You can purchase up to {maxRecipients} memberships for multiple
        recipients.
      </span>
      {minRecipients > 1 && (
        <span className="text-sm pt-1 block">
          You need add at least {minRecipients} recipients to proceede.
        </span>
      )}
      {showList && (
        <>
          {recipients?.map((recipient) => {
            const { userAddress, keyId, metadata, index } = recipient
            const key = keyId ?? userAddress
            const showMetadata = showMetadataList.includes(index)

            return (
              <InputGroup key={key}>
                <div className="flex items-center">
                  <span className="text-xs font-medium uppercase">
                    Recipient {index}:
                  </span>

                  {!addNewRecipient && (
                    <div className="flex items-center">
                      <Tooltip
                        label="Remove recipient"
                        tip="Remove recipient"
                        side="right"
                      >
                        <CloseIcon
                          className="text-red-500 ml-1 cursor-pointer text-base hover:text-red-600"
                          onClick={() => {
                            removeRecipient(index)
                          }}
                        />
                      </Tooltip>
                      <Tooltip
                        label="Edit recipient"
                        tip="Edit recipient"
                        side="right"
                      >
                        <EditIcon
                          className="text-grey-500 ml-1 cursor-pointer text-base hover:text-black-600"
                          onClick={() => {
                            onEditRecipient(index, metadata, userAddress)
                          }}
                        />
                      </Tooltip>
                      {withMetadata && (
                        <button
                          className="text-sm cursor-pointer text-blue-600 ml-1"
                          style={{
                            fontSize: '0.8rem',
                          }}
                          onClick={() => onToggleMetadata(index)}
                          type="button"
                        >
                          {showMetadata ? 'Hide metadata' : 'Show metadata'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <ItemRows>
                  <span className="text-xs block">{userAddress}</span>
                  {showMetadata &&
                    Object.entries(metadata ?? {}).map(([key, value]) => {
                      return (
                        <div key={key}>
                          <span className="text-xs font-medium">{key}:</span>
                          <span className="text-xs"> {value}</span>
                        </div>
                      )
                    })}
                </ItemRows>
              </InputGroup>
            )
          })}
          <AddButton onClick={toggleAddRecipient} type="button">
            Add recipient
          </AddButton>
        </>
      )}
      {showForm && (
        <fieldset className="pt-3" disabled={loading}>
          <span className="text-xs font-normal uppercase flex justify-between items-center mb-2">
            {isEdit && <span>Edit recipient {editIndex}</span>}
            {addNewRecipient && <span>Add recipient</span>}
          </span>
          <CustomRecipient
            onChange={(e) => setRecipient(e.target.value)}
            value={recipient}
            disabled={loading}
          />
          {fields.map(({ name, type, required, placeholder }) => (
            <label key={name} htmlFor={name}>
              <span className="text-xs font-normal uppercase">
                {name}
                {required && <span className="text-red-600">*</span>}
              </span>
              <CustomRecipient
                placeholder={placeholder}
                type={type}
                required={required}
                disabled={loading}
                {...register(name, { required })}
              />
            </label>
          ))}
          <div className="flex items-center justify-center">
            <AddButton
              onClick={onSaveRecipient}
              type="button"
              style={{
                marginLeft: 0,
                marginRight: 0,
              }}
              disabled={loading}
            >
              <span className="px-2">{addNewRecipient ? 'Add' : 'Update'}</span>
              {loading && <Loading size={20} />}
            </AddButton>
            <AddButton
              onClick={resetStatus}
              type="button"
              style={{
                marginLeft: '1rem',
                marginRight: 0,
              }}
              disabled={loading}
            >
              <span className="px-2"> Close </span>
            </AddButton>
          </div>
        </fieldset>
      )}
      {haveRecipients && (
        <Button
          type="button"
          disabled={addNewRecipient || isEdit || isLoading}
          onClick={onSubmit}
        >
          Continue
        </Button>
      )}
    </form>
  )
}

const CustomRecipient = styled.input`
  height: 36px;
  border-radius: 4px;
  border: 1px solid var(--lightgrey);
  width: 100%;
  padding: 5px;

  + input {
    margin-top: 8px;
  }

  &:disabled {
    background-color: var(--lightgrey);
  }
`

const AddButton = styled.button`
  cursor: pointer;
  background: #ffffff;
  border: 1px solid var(--lightgrey);
  border-color: var(--lightgrey);
  color: var(--darkgrey);
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 13px;
  display: flex;
  margin: 0 auto;
  margin-top: 8px;

  &:disabled {
    opacity: 0.4;
  }
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  grid-row-gap: 2px;
  padding: 8px 0;

  & + & {
    border-top: 0.5px solid var(--lightgrey);
  }

  &:required {
    color: var(--red);
    content: ' *';
  }
`

const ItemRows = styled.div`
  display: flex;
  flex-direction: column;
`
