import React, { useState } from 'react'
import QRCode from 'qrcode.react'
import InlineModal from '../InlineModal'
import { Input, SubmitButton, DisabledButton } from '../user-account/styles'

interface Props {
  active: boolean
  dismiss: () => void
  value: string
  sendEmail: (recipient: string) => void
}

export const QRModal = ({ active, dismiss, value, sendEmail }: Props) => {
  const [recipient, setRecipient] = useState('')
  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setRecipient(evt.currentTarget.value)
  }

  return (
    <InlineModal active={active} dismiss={dismiss}>
      <QRCode value={value} size={256} includeMargin />
      <Input
        type="text"
        value={recipient}
        onChange={handleChange}
        placeholder="Email address"
      />
      <Submit
        active={recipient.length > 0}
        submit={() => sendEmail(recipient)}
      />
    </InlineModal>
  )
}

interface SubmitProps {
  active: boolean
  submit: () => void
}
const Submit = ({ active, submit }: SubmitProps) => {
  if (active) {
    return <SubmitButton onClick={submit}>Send Email</SubmitButton>
  }
  return <DisabledButton>Send Email</DisabledButton>
}

export default QRModal
