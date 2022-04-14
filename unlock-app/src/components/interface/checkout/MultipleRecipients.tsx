import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { RecipientItem } from '../../../hooks/useMultipleRecipient'
import { MetadataInput } from '../../../unlockTypes'
import { ToastHelper } from '../../helpers/toast.helper'
import Loading from '../Loading'
import { Button } from './FormStyles'

interface MultipleRecipientProps {
  recipients: RecipientItem[]
  maxRecipients: number
  addRecipient: any
  loading: boolean
  fields: Array<MetadataInput & { value?: any }>
  submitBulkRecipients: () => void
  onContinue: () => void
}
export const MultipleRecipient: React.FC<MultipleRecipientProps> = ({
  recipients,
  maxRecipients,
  addRecipient,
  loading,
  fields = [],
  submitBulkRecipients,
  onContinue,
}) => {
  const [addNewRecipient, setNewRecipient] = useState(false)
  const [recipient, setRecipient] = useState<string>('')
  const { register, getValues, reset, trigger } = useForm()
  const haveRecipients = recipients?.length > 0

  const onAddRecipient = async () => {
    await trigger()
    const valid = await addRecipient(recipient, getValues())
    if (valid) {
      resetStatus()
    }
  }

  const resetStatus = () => {
    setNewRecipient(false)
    setRecipient('')
    reset()
  }

  const onSubmit = async () => {
    await submitBulkRecipients()
  }

  const toggleAddRecipient = () => {
    if (recipients?.length < maxRecipients) {
      setNewRecipient(!addNewRecipient)
    } else {
      ToastHelper.error("You can't add more recipients")
    }
  }

  const onContinueCallback = async () => {
    await onSubmit()
    onContinue()
  }

  return (
    <form>
      <span className="text-sm pt-2">
        You can purchase up to {maxRecipients} memberships for multiple
        recipients.
      </span>
      {recipients?.map(({ userAddress, keyId, metadata }, index) => {
        const key = keyId ?? userAddress
        const currentIndex = index + 1
        return (
          <InputGroup key={key}>
            <span className="text-xs font-medium uppercase">
              Recipient {currentIndex}:
            </span>

            <ItemRows>
              <div>
                <span className="text-xs font-medium">address:</span>
                <span className="text-xs">{userAddress}</span>
              </div>
              {Object.entries(metadata ?? {}).map(([key, value]) => {
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
      {!addNewRecipient ? (
        <>
          <AddButton onClick={toggleAddRecipient} type="button">
            Add recipient
          </AddButton>
        </>
      ) : (
        <fieldset className="pt-3" disabled={loading}>
          <span className="text-xs font-normal uppercase">Recipient</span>
          <CustomRecipient
            onChange={(e) => setRecipient(e.target.value)}
            disabled={loading}
          />
          {fields.map(({ name, type, required, placeholder }) => (
            <label key={name} htmlFor={name}>
              <span className="text-xs font-normal uppercase">{name}</span>
              <CustomRecipient
                placeholder={placeholder}
                type={type}
                required={required}
                disabled={loading}
                {...register(name, { required })}
              />
            </label>
          ))}
          <AddButton onClick={onAddRecipient} type="button" disabled={loading}>
            <span className="px-2"> Add </span>
            {loading && <Loading size={20} />}
          </AddButton>
        </fieldset>
      )}
      {haveRecipients && (
        <Button
          type="button"
          disabled={addNewRecipient}
          onClick={onContinueCallback}
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
