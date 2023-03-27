import React, { useMemo, useState } from 'react'
import QRCode from 'qrcode.react'
import { Button, Input, Icon, Modal } from '@unlock-protocol/ui'
import { FaEnvelope } from 'react-icons/fa'
import { Key } from '~/hooks/useKeys'

interface Props {
  isOpen: boolean
  dismiss: () => void
  setIsOpen: (open: boolean) => void
  sendEmail: (recipient: string, qrImage: string) => void
  signature: any
  lock: Key['lock']
}

export const QRModal = ({
  isOpen,
  setIsOpen,
  sendEmail,
  signature,
  dismiss,
}: Props) => {
  const [recipient, setRecipient] = useState('')
  const [isValid, setIsValid] = useState(false)
  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setRecipient(evt.currentTarget.value)
    setIsValid(evt.currentTarget.validity.valid)
  }

  const QRUrl = useMemo(() => {
    if (!signature) {
      return
    }
    const url = new URL(`${window.location.origin}/verification`)
    const data = encodeURIComponent(signature.payload)
    const sig = encodeURIComponent(signature.signature)
    url.searchParams.append('data', data)
    url.searchParams.append('sig', sig)
    // eslint-disable-next-line no-console
    console.log(url.toString()) // debugging
    return url.toString()
  }, [signature])

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={() => {
        setIsOpen(false)
        dismiss()
      }}
    >
      <div className="flex flex-col gap-3">
        <div className="mx-auto">
          {QRUrl && <QRCode value={QRUrl} size={256} includeMargin />}
        </div>
        <Input
          className="my-4 w-90"
          type="email"
          required
          value={recipient}
          onChange={handleChange}
          placeholder="your@email.com"
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
      </div>
    </Modal>
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
        className="w-full m-1"
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
      className="w-full m-1"
      iconLeft={<Icon icon={FaEnvelope} size="medium" key="Smart Phone" />}
      disabled={submitted}
    >
      Receive by email
    </Button>
  )
}
