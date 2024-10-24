import { useCallback, useEffect, useState } from 'react'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import type { OAuthConfig } from '~/unlockTypes'

import { ConfirmConnect } from './ConfirmConnect'
import { Step, StepButton, StepTitle } from '../Stepper'
import { ConnectPage } from '../main/ConnectPage'
import { TopNavigation } from '../Shell'
import { PaywallConfigType } from '@unlock-protocol/core'
import { isInIframe } from '~/utils/iframe'
import { useAuthenticate } from '~/hooks/useAuthenticate'

interface Props {
  oauthConfig: OAuthConfig
  paywallConfig: PaywallConfigType
  communication?: ReturnType<typeof useCheckoutCommunication>
}

interface StepperProps {
  state: string
  onChange: (state: string) => void
}

export const Stepper = ({ state, onChange }: StepperProps) => {
  const steps = ['connect', 'confirm']

  return (
    <div className="flex items-center gap-1.5">
      {steps.map((step: string, idx: number) => {
        const isActive = step === state
        if (isActive) {
          return (
            <>
              <Step active>{idx + 1}</Step>
              <StepTitle key={idx}>{steps[idx]}</StepTitle>
            </>
          )
        } else if (steps.indexOf(state) > idx) {
          return (
            <StepButton
              key={idx}
              onClick={() => {
                onChange(steps[idx])
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
  const { account, signInWithPrivy, signOut } = useAuthenticate()
  const [state, setState] = useState('connect')

  const onClose = useCallback(
    (params: Record<string, string> = {}) => {
      if (oauthConfig.redirectUri) {
        const redirectURI = new URL(oauthConfig.redirectUri)

        for (const [key, value] of Object.entries(params)) {
          redirectURI.searchParams.append(key, value)
        }
        return window.location.assign(redirectURI)
      } else if (!isInIframe() || !communication) {
        window.history.back()
      } else {
        communication.emitCloseModal()
      }
    },
    [oauthConfig.redirectUri, communication]
  )

  useEffect(() => {
    if (!account) {
      signInWithPrivy({
        onshowUI: () => {
          setState('connect')
        },
      })
      return
    } else {
      return setState('confirm')
    }
  }, [account])

  const changeState = async (state: string) => {
    if (state === 'connect') {
      await signOut()
    }
    setState(state)
  }

  return (
    <div className="bg-white z-10 shadow-xl max-w-md rounded-xl flex flex-col w-full h-[90vh] sm:h-[80vh] min-h-[32rem] max-h-[42rem]">
      <TopNavigation onClose={onClose} />
      <div className="flex items-center justify-between w-full gap-2 p-2 px-6 border-b">
        <div className="flex items-center gap-1.5">
          <Stepper onChange={changeState} state={state} />
        </div>
      </div>
      {!account && (
        <ConnectPage showPrivyModal={true} style="h-full mt-4 space-y-5" />
      )}
      {account && (
        <ConfirmConnect
          className="h-full mt-4 space-y-5"
          communication={communication}
          onClose={onClose}
          oauthConfig={oauthConfig}
        />
      )}
    </div>
  )
}
