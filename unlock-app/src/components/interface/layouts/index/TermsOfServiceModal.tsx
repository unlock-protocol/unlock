'use client'
import { Button, Modal } from '@unlock-protocol/ui'
import React from 'react'
import useTermsOfService from '~/hooks/useTermsOfService'
import { config } from '~/config/app'

export default function TermsOfServiceModal() {
  const { termsAccepted, saveTermsAccepted, termsLoading } = useTermsOfService()
  const showTermsModal = !termsLoading && !termsAccepted

  return (
    <Modal
      isOpen={showTermsModal}
      setIsOpen={() => {
        saveTermsAccepted()
      }}
    >
      <div className="flex flex-col justify-center gap-4 bg-white">
        <span className="text-base">
          No account required{' '}
          <span role="img" aria-label="stars">
            ✨
          </span>
          , but you need to agree to our{' '}
          <a
            className="outline-none text-brand-ui-primary"
            href={`${config.unlockStaticUrl}/terms`}
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            className="outline-none text-brand-ui-primary"
            href={`${config.unlockStaticUrl}/privacy`}
          >
            Privacy Policy
          </a>
          .
        </span>
        <Button onClick={saveTermsAccepted}>I agree</Button>
      </div>
    </Modal>
  )
}
