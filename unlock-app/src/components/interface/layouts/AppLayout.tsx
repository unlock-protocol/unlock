import useTermsOfService from '~/hooks/useTermsOfService'
import { useConfig } from '~/utils/withConfig'
import Loading from '../Loading'
import { Button, Modal } from '@unlock-protocol/ui'
import { AppFooter } from '../AppFooter'
import { AppHeader } from '../AppHeader'
import { Container } from '../Container'
import { useAuth } from '~/contexts/AuthenticationContext'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ImageBar } from '../locks/Manage/elements/ImageBar'
import React from 'react'

interface DashboardLayoutProps {
  title?: string
  description?: React.ReactNode
  children: React.ReactNode
  authRequired?: boolean
  showLinks?: boolean
}

const WalletNotConnected = () => {
  const [loginUrl, setLoginUrl] = useState<string>('')
  useEffect(() => {
    setLoginUrl(`/login?redirect=${encodeURIComponent(window.location.href)}`)
  }, [])

  return (
    <ImageBar
      src="/images/illustrations/wallet-not-connected.svg"
      description={
        <>
          <span>
            Wallet is not connected yet.{' '}
            <Link href={loginUrl}>
              <span className="cursor-pointer text-brand-ui-primary">
                Connect it now
              </span>
            </Link>
          </span>
        </>
      }
    />
  )
}

export const AppLayout = ({
  title,
  description,
  children,
  authRequired = true,
  showLinks = true,
}: DashboardLayoutProps) => {
  const { account } = useAuth()
  const { termsAccepted, saveTermsAccepted, termsLoading } = useTermsOfService()
  const config = useConfig()

  if (termsLoading) {
    return <Loading />
  }

  const showLogin = authRequired && !account

  return (
    <div className="bg-ui-secondary-200">
      <Modal
        isOpen={!termsAccepted}
        setIsOpen={() => {
          saveTermsAccepted()
        }}
      >
        <div className="flex flex-col justify-center gap-4 p-8 bg-white">
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

      <div className="w-full">
        <AppHeader showLinks={showLinks} />
        <div className="min-w-full min-h-screen">
          <div className="pt-8">
            <Container>
              <div className="flex flex-col gap-10">
                {(title || description) && (
                  <div className="flex flex-col gap-4">
                    {title && <h1 className="text-4xl font-bold">{title}</h1>}
                    {description && <div>{description}</div>}
                  </div>
                )}
                {showLogin ? (
                  <div className="flex justify-center">
                    <WalletNotConnected />
                  </div>
                ) : (
                  <div>{children}</div>
                )}
              </div>
            </Container>
          </div>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}
