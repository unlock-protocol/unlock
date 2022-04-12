import React, { useState } from 'react'
import styled from 'styled-components'
import { RecipientItem } from '../../../hooks/useMultipleRecipient'
import Loading from '../Loading'

interface MultipleRecipientProps {
  recipients: RecipientItem[]
  maxRecipients: number
  addRecipient: any
  loading: boolean
}
export const MultipleRecipient: React.FC<MultipleRecipientProps> = ({
  recipients,
  maxRecipients,
  addRecipient,
  loading,
}) => {
  const [addNewRecipient, setNewRecipient] = useState(false)
  const [recipient, setRecipient] = useState<string>('')
  const onAddRecipient = async () => {
    const valid = await addRecipient(recipient)
    if (valid) {
      resetStatus()
    }
  }

  const resetStatus = () => {
    setNewRecipient(false)
    setRecipient('')
  }

  const onSubmit = () => {}

  const toggleAddRecipient = () => {
    setNewRecipient(!addNewRecipient)
  }

  return (
    <form onSubmit={onSubmit}>
      <span className="text-sm pt-2">
        You can purchase up to {maxRecipients} memberships for multiple
        recipients
      </span>
      {recipients?.map((recipient, index) => {
        const key = recipient.keyId ?? recipient.userAddress
        const currentIndex = index + 1
        return (
          <InputGroup key={key}>
            <span className="text-xs font-medium uppercase">
              Recipient {currentIndex}:
            </span>
            <span className="text-xs">{recipient?.userAddress}</span>
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
        <div className="pt-3">
          <CustomRecipient
            onChange={(e) => setRecipient(e.target.value)}
            disabled={loading}
          />
          <AddButton onClick={onAddRecipient} type="button" disabled={loading}>
            <span className="px-2"> Save recipient </span>
            {loading && <Loading size={20} />}
          </AddButton>
        </div>
      )}
    </form>
  )
}

const CustomRecipient = styled.input`
  height: 36px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  width: 100%;
  padding: 2px;

  + input {
    margin-top: 8px;
  }
`

const AddButton = styled.button`
  cursor: pointer;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-color: #dcdfe6;
  color: #606266;
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
  padding-top: 8px;
`
