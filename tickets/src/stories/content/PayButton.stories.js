import React from 'react'
import { storiesOf } from '@storybook/react'
import { PayButton } from '../../components/content/purchase/PayButton'
import { KeyStatus } from '../../selectors/keys'

const config = {
  requiredConfirmations: 12,
}
const purchaseKey = () => {}

const tx = (status, confirmations) => ({
  status,
  confirmations,
})
const submittedTx = tx('submitted', 0)
const minedTx = tx('mined', 6)
const confirmedTx = tx('mined', 12)

storiesOf('PayButton', module)
  .add('Default', () => (
    <PayButton transaction={{}} purchaseKey={purchaseKey} config={config} />
  ))
  .add('Payment Sent', () => (
    <PayButton
      transaction={submittedTx}
      purchaseKey={purchaseKey}
      config={config}
    />
  ))
  .add('Confirming', () => (
    <PayButton
      transaction={minedTx}
      purchaseKey={purchaseKey}
      config={config}
    />
  ))
  .add('Confirmed', () => (
    <PayButton
      transaction={confirmedTx}
      purchaseKey={purchaseKey}
      config={config}
    />
  ))
  .add('Confirming (key, no transaction)', () => (
    <PayButton
      purchaseKey={purchaseKey}
      keyStatus={KeyStatus.CONFIRMING}
      config={config}
    />
  ))
  .add('Valid (key, no transaction)', () => (
    <PayButton
      purchaseKey={purchaseKey}
      keyStatus={KeyStatus.VALID}
      config={config}
    />
  ))
