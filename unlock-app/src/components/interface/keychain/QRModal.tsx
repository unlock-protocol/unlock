import React, { useState } from 'react'
import QRCode from 'qrcode.react'
import InlineModal from '../InlineModal'

interface Props {
  active: boolean
  dismiss: () => void
  sendEmail: (recipient: string, qrImage: string) => void
  signature: any
}

export const QRModal = ({ active, dismiss, sendEmail, signature }: Props) => {
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
    return url.toString()
  }

  return (
    <InlineModal active={active} dismiss={dismiss}>
      <QRCode value={QRUrl()} size={256} includeMargin />
      <input
        className="w-full my-4"
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
  if (active) {
    return (
      <button
        type="button"
        disabled={submitted}
        className="bg-[#74ce63] text-white flex justify-center w-full p-1 font-medium rounded hover:bg-[#59c245] disabled:hover:bg-[#74ce63] disabled:cursor-not-allowed"
        onClick={() => {
          setSubmitted(true)
          submit()
        }}
      >
        {submitted ? 'Sent!' : 'Send Email'}
      </button>
    )
  }
  return (
    <button
      disabled={submitted}
      type="button"
      className="flex justify-center w-full p-1 font-medium bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-200 disabled:opacity-75 disabled:cursor-not-allowed"
    >
      Send Email
    </button>
  )
}
