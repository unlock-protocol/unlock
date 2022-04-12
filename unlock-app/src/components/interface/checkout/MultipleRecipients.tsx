import React from 'react'
import styled from 'styled-components'
import { RecipientItem } from '../../../hooks/useMultipleRecipient'

interface MultipleRecipientProps {
  recipients: RecipientItem[]
  maxRecipients: number
}
export const MultipleRecipient: React.FC<MultipleRecipientProps> = ({
  recipients,
  maxRecipients,
}) => {
  const onAddWallet = () => {}

  return (
    <div>
      <span className="text-sm">
        You can purchase up to {maxRecipients} memberships for multiple recipients
      </span>
      {recipients?.map((recipient) => {
        return (
          <CustomRecipient
            key={recipient.keyId ?? recipient.userAddress}
            type="text"
          />
        )
      })}
      <AddButton onClick={onAddWallet} type="button">
        Add Wallet
      </AddButton>
    </div>
  )
}

const CustomRecipient = styled.input`
  height: 36px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  width: 100%;

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
