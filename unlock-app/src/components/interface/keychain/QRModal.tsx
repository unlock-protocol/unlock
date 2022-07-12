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
  const isEthCC =
    [
      '0xd0a031d9f9486b1d914124d0c1fcac2e9e6504fe',
      '0x072149617e12170696481684598a696e9a4d46ff',
      '0xf181e18e007517605f369eccf0eee6ebb1b10133',
      '0x6d8c3d90340fa33693a88d1411b0f32df12d0683',
      '0xf99eb828ac365c54fcbb6779a78417c25f113829',
      '0x9ab351cb5dae55abd135dd256726851aae8efeb5',
      '0x4624bbf6d685b1057eecacc691b0a068e287f0a5',
      '0x623da3e4d4cb9c98dabb4c23789ed5aaa20ea3aa',
    ].indexOf(lock.address.toLowerCase()) > -1

  const addToPhone = () => {
    window.open(
      `https://ethcc.ethpass.xyz/integrations/ethcc?payload=${encodeURIComponent(
        QRUrl()
      )}`
    )
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
      {isEthCC && (
        <Button
          className="w-10/12 m-1"
          iconLeft={<Icon icon={FaMobile} size="medium" key="Smart Phone" />}
          onClick={addToPhone}
        >
          {' '}
          Add to phone
        </Button>
      )}
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
