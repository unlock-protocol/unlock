// ABOUTME: Shows a one-time terms of service acceptance modal on first visit.
// Acceptance is persisted in localStorage so the modal only appears once.
'use client'

import { Button, Modal } from '@unlock-protocol/ui'
import { useTermsOfService } from '~/hooks/useTermsOfService'

export function TermsOfServiceModal() {
  const { termsAccepted, saveTermsAccepted, termsLoading } = useTermsOfService()
  const showTermsModal = !termsLoading && !termsAccepted

  return (
    <Modal isOpen={showTermsModal} setIsOpen={saveTermsAccepted}>
      <div className="flex flex-col justify-center gap-4 bg-white">
        <span className="text-base">
          No account required ✨, but you need to agree to our{' '}
          <a
            className="text-brand-ui-primary outline-none"
            href="https://unlock-protocol.com/terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            className="text-brand-ui-primary outline-none"
            href="https://unlock-protocol.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
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
