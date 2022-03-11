import React from 'react'
import { Input, Label, SmallButton } from './FormStyles'

interface CheckoutCustomRecipientProps {
  isAdvanced: boolean
  advancedRecipientValid: boolean
  checkingRecipient: boolean
  setIsAdvanced: (advanced: boolean) => void
  onRecipientChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  customBuyMessage?: string
}

export const CheckoutCustomRecipient: React.FC<
  CheckoutCustomRecipientProps
> = ({
  isAdvanced,
  setIsAdvanced,
  onRecipientChange,
  advancedRecipientValid,
  checkingRecipient,
  customBuyMessage,
}) => {
  return (
    <>
      <SmallButton onClick={() => setIsAdvanced(!isAdvanced)}>
        {isAdvanced ? 'Close advanced' : customBuyMessage ?? 'Advanced'}
      </SmallButton>
      {isAdvanced && (
        <>
          <Label>Recipient</Label>
          <Input
            type="text"
            placeholder="Recipient address"
            name="recipient"
            onChange={onRecipientChange}
            style={{ marginBottom: '0.2rem' }}
          />
          {!advancedRecipientValid && !checkingRecipient && (
            <span
              style={{
                color: 'var(--red)',
                fontSize: '12px',
                textAlign: 'center',
              }}
            >
              Enter a valid recipient address
            </span>
          )}
        </>
      )}
    </>
  )
}

CheckoutCustomRecipient.defaultProps = {
  customBuyMessage: undefined,
}
