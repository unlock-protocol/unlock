import React, { useState } from 'react'
import QRCode from 'qrcode.react'
import InlineModal from '../InlineModal'
import { Button, Input, Icon } from '@unlock-protocol/ui'
import { FaEnvelope, FaMobile } from 'react-icons/fa'

interface Props {
  active: boolean
  dismiss: () => void
  sendEmail: (recipient: string, qrImage: string) => void
  signature: any
  lock: any
}

export const QRModal = ({
  active,
  dismiss,
  sendEmail,
  signature,
  lock,
}: Props) => {
  const [recipient, setRecipient] = useState('')
  const [isValid, setIsValid] = useState(false)
  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setRecipient(evt.currentTarget.value)
    setIsValid(evt.currentTarget.validity.valid)
  }

  const QRUrl = () => {
    const url = new URL(`${window.location.origin}/verification`)
    const data = encodeURIComponent(signature.payload)
    const sig = encodeURIComponent(signature.signature)
    url.searchParams.append('data', data)
    url.searchParams.append('sig', sig)

    // eslint-disable-next-line no-console
    console.log(url.toString()) // debugging
    return url.toString()
  }

  return (
    <InlineModal active={active} dismiss={dismiss}>
      <QRCode value={QRUrl()} size={256} includeMargin />
      <Input
        className="w-90 my-4"
        type="email"
        required
        value={recipient}
        onChange={handleChange}
        placeholder="me@domain.tld"
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
  if (active) {
    return (
      <Button
        className="w-10/12 m-1"
        iconLeft={<Icon icon={FaEnvelope} size="medium" key="Smart Phone" />}
        disabled={submitted}
        onClick={() => {
          setSubmitted(true)
          submit()
        }}
      >
        {submitted ? 'Sent!' : 'Receive by email'}
      </Button>
    )
  }
  return (
    <Button
      className="w-10/12 m-1"
      iconLeft={<Icon icon={FaEnvelope} size="medium" key="Smart Phone" />}
      disabled={submitted}
    >
      Receive by email
    </Button>
  )
}
