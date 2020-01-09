import React, { useState } from 'react'
import QRCode from 'qrcode.react'
import InlineModal from '../InlineModal'
import { Input, SubmitButton, DisabledButton } from '../user-account/styles'

interface Props {
  active: boolean
  dismiss: () => void
  value: string
  sendEmail: (recipient: string, qrImage: string) => void
}

export const QRModal = ({ active, dismiss, value, sendEmail }: Props) => {
  const [recipient, setRecipient] = useState('')
  const [isValid, setIsValid] = useState(false)
  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setRecipient(evt.currentTarget.value)
    setIsValid(evt.currentTarget.validity.valid)
  }

  return (
    <InlineModal active={active} dismiss={dismiss}>
      <QRCode value={value} size={256} includeMargin />
      <Input
        type="email"
        required
        value={recipient}
        onChange={handleChange}
        placeholder="Email address"
      />
      <Submit
        active={isValid}
        submit={() => {
          const canvas = document.querySelector('canvas')
          if (canvas) {
            sendEmail(recipient, canvas.toDataURL())
          }
        }}
      />
    </InlineModal>
  )
}

export default QRModal

interface SubmitProps {
  active: boolean
  submit: () => void
}
const Submit = ({ active, submit }: SubmitProps) => {
  const [submitted, setSubmitted] = useState(false)
  if (submitted) {
    return <DisabledButton>Sent!</DisabledButton>
  }
  if (active) {
    return (
      <SubmitButton
        onClick={() => {
          setSubmitted(true)
          submit()
        }}
      >
        Send Email
      </SubmitButton>
    )
  }
  return <DisabledButton>Send Email</DisabledButton>
}
