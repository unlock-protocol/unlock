import React from 'react'
import { Input, Label, SmallButton } from './FormStyles'

interface CheckoutCustomRecipientProps {
  isAdvanced: boolean
  advancedRecipientValid: boolean
  checkingRecipient: boolean
  setIsAdvanced: (advanced: boolean) => void
  onRecipientChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  customBuyMessage?: string
  disabled?: boolean
  loading?: boolean
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
  disabled,
  loading,
}) => {
  return (
    <>
      <SmallButton
        disabled={loading}
        onClick={() => setIsAdvanced(!isAdvanced)}
      >
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
            disabled={disabled}
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
          {(advancedRecipientValid || checkingRecipient) && (
            <span
              style={{
                fontSize: '12px',
                textAlign: 'center',
              }}
            >
              &nbsp;
            </span>
          )}
        </>
      )}
    </>
  )
}

CheckoutCustomRecipient.defaultProps = {
  customBuyMessage: undefined,
  disabled: false,
  loading: false,
}
