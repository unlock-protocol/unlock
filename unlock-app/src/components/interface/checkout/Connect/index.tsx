import React, { useCallback, useMemo, useState } from 'react'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import type { OAuthConfig } from '~/unlockTypes'
import { ConfirmConnect } from './ConfirmConnect'
import { connectMachine } from './connectMachine'
import { TopNavigation } from '../Shell'
import { useMachine } from '@xstate/react'
import { Step, StepButton, StepTitle } from '../Stepper'
import { ConnectPage } from '../main/ConnectPage'

interface Props {
  oauthConfig: OAuthConfig
  injectedProvider: unknown
  communication: ReturnType<typeof useCheckoutCommunication>
}

interface StepperProps {
  onChange: (step: string) => void
  state: string
}

export const Stepper = ({ onChange, state }: StepperProps) => {
  const steps = ['connect', 'confirm']
  const [currentState, setCurentState] = useState(steps.indexOf(state))

  return (
    <div className="flex items-center gap-1.5">
      {steps.map((step: string, idx: number) => {
        const isActive = step === steps[currentState]
        if (isActive) {
          return (
            <>
              <Step active>{idx + 1}</Step>
              <StepTitle key={idx}>{steps[idx]}</StepTitle>
            </>
          )
        } else if (currentState > idx) {
          return (
            <StepButton
              key={idx}
              onClick={() => {
                setCurentState(step)
                onChange(step)
              }}
            >
              {idx + 1}
            </StepButton>
          )
        } else {
          return <Step key={idx}>{idx + 1}</Step>
        }
      })}
    </div>
  )
}

export function Connect({ oauthConfig, communication }: Props) {
  const [isConnected, setIsConnected] = React.useState(false)

  const onClose = useCallback(
    (params: Record<string, string> = {}) => {
      // Reset the Paywall State!

      if (oauthConfig.redirectUri) {
        const redirectURI = new URL(oauthConfig.redirectUri)

        for (const [key, value] of Object.entries(params)) {
          redirectURI.searchParams.append(key, value)
        }
        return window.location.assign(redirectURI)
      } else if (!communication?.insideIframe) {
        window.history.back()
      } else {
        communication.emitCloseModal()
      }
    },
    [oauthConfig.redirectUri, communication, connectService]
  )

  const onBack = useMemo(() => {
    const unlockAccount = state.children?.unlockAccount
    const canBackInUnlockAccountService = unlockAccount
      ?.getSnapshot()
      .can({ type: 'BACK' })
    const canBack = state.can({ type: 'BACK' })
    if (canBackInUnlockAccountService) {
      return () => unlockAccount.send({ type: 'BACK' })
    }
    if (canBack) {
      return () => connectService.send({ type: 'BACK' })
    }
    return undefined
  }, [state, connectService])

  return (
    <div className="bg-white z-10 shadow-xl max-w-md rounded-xl flex flex-col w-full h-[90vh] sm:h-[80vh] min-h-[32rem] max-h-[42rem]">
      <TopNavigation onClose={onClose} onBack={onBack} />
      <div className="flex items-center justify-between w-full gap-2 p-2 px-6 border-b">
        <div className="flex items-center gap-1.5">
          <Stepper onChange={console.log} />
        </div>
      </div>
      {!isConnected && (
        <ConnectPage
          style="h-full mt-4 space-y-5"
          onNext={() => {
            console.log('connected! ')
            setIsConnected(true)
            // onConfirm()
          }}
        />
      )}
      <ConfirmConnect
        communication={communication}
        onClose={onClose}
        oauthConfig={oauthConfig}
      />
    </div>
  )
}
