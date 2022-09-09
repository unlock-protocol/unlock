import { Button } from '@unlock-protocol/ui'
import React, { useEffect, useState } from 'react'
import { useMutation } from 'react-query'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { UNLIMITED_KEYS_COUNT, UNLIMITED_KEYS_DURATION } from '~/constants'
import { useAuth } from '~/contexts/AuthenticationContext'
import useLocks from '~/hooks/useLocks'
import { CreateLockForm, LockFormProps } from './elements/CreateLockForm'
import { CreateLockFormSummary } from './elements/CreateLockFormSummary'

export type Step = 'data' | 'summary' | 'deploy'

interface LockCreatePayloadProps {
  name: string
  expirationDuration?: number
  maxNumberOfKeys?: number
  currencyContractAddress?: string
  keyPrice?: string | number
}
interface CreateLockSummaryProps {
  lock: LockFormProps
  network: number
  setStep: (step: Step, data: LockFormProps) => void
  onSubmit: (data: LockFormProps) => void
}

interface CreateLockProps {
  onSubmit: (data: LockFormProps) => void
  defaultValues: LockFormProps
}

interface CreateLockStepsProps {
  onStepChange: (step: Step) => void
}

export const CreateLockSteps: React.FC<CreateLockStepsProps> = ({
  onStepChange,
}) => {
  const { account: owner, network } = useAuth()
  const [step, setStep] = useState<Step>('data')
  const [values, setValues] = useState<LockFormProps | undefined>(undefined)
  const { addLock, locks } = useLocks(owner!)

  const changeStep = (step: Step, data?: LockFormProps) => {
    setStep(step)
    setValues(data)
  }

  const onFormSubmit = (data: LockFormProps) => {
    changeStep('summary', data)
  }

  const onSummarySubmit = async (data: LockFormProps) => {
    await createLockMutation.mutateAsync(data)
  }

  useEffect(() => {
    if (typeof onStepChange === 'function') {
      onStepChange(step)
    }
  }, [onStepChange, step])

  const createLockPromise = async (data: LockCreatePayloadProps) => {
    return await addLock(data, () => {
      if (step !== 'deploy') {
        changeStep('deploy', values)
      }
    })
  }

  console.log(locks)

  const createLockMutation = useMutation(
    ({
      name,
      unlimitedDuration,
      unlimitedQuantity,
      keyPrice,
      currencyContractAddress,
      maxNumberOfKeys,
      expirationDuration,
    }: LockFormProps) => {
      const payload: LockCreatePayloadProps = {
        name,
        expirationDuration: unlimitedDuration
          ? UNLIMITED_KEYS_DURATION
          : expirationDuration,
        maxNumberOfKeys: unlimitedQuantity
          ? UNLIMITED_KEYS_COUNT
          : maxNumberOfKeys,
        currencyContractAddress,
        keyPrice,
      }
      return createLockPromise(payload)
    },
    {
      onError: (error) => {
        console.error(error)
        ToastHelper.error('There is some unexpected issue, please try again')
      },
    }
  )

  return (
    <div>
      {step === 'data' && (
        <CreateLock onSubmit={onFormSubmit} defaultValues={values!} />
      )}
      {step === 'summary' && (
        <div>
          <CreateLockSummary
            setStep={setStep}
            lock={values!}
            network={network!}
            onSubmit={onSummarySubmit}
          />
        </div>
      )}
      {step === 'deploy' && (
        <CreateLockFormSummary lock={values!} network={network!} showStatus />
      )}
    </div>
  )
}

const CreateLock: React.FC<CreateLockProps> = ({ onSubmit, defaultValues }) => {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-28">
        <div className="flex flex-col mx-auto md:max-w-lg">
          <h4 className="mb-4 text-5xl font-bold">
            Connect with your 1000 true fans
          </h4>
          <span className="text-lg font-normal">
            For creative communities and the humans who build them
          </span>
          <img
            className="hidden mt-9 md:block"
            src="/images/svg/members.svg"
            alt=""
          />
        </div>
        <div className="md:max-w-lg">
          <CreateLockForm onSubmit={onSubmit} defaultValues={defaultValues} />
        </div>
      </div>
    </div>
  )
}

const CreateLockSummary: React.FC<CreateLockSummaryProps> = ({
  lock,
  network,
  setStep,
  onSubmit,
}) => {
  const onHandleSubmit = () => {
    if (typeof onSubmit === 'function') {
      onSubmit(lock)
    }
  }

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-28">
        <div className="flex flex-col mx-auto md:max-w-lg">
          <h4 className="mb-4 text-5xl font-bold">Ready to deploy?</h4>
          <span className="text-lg font-normal">
            Here is the overview of your Lock
          </span>
          <img
            className="hidden max-w-xs mt-28 md:block"
            src="/images/svg/lock.svg"
            alt=""
          />
        </div>
        <div className="md:max-w-lg">
          <CreateLockFormSummary lock={lock} network={network} />
          <div className="flex flex-col justify-between w-full gap-4 px-12 mt-12">
            <Button onClick={onHandleSubmit}>Look good for me</Button>
            <span
              className="font-bold text-center cursor-pointer"
              onClick={() => setStep('data', lock)}
            >
              Back to Edit
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
