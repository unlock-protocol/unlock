import { networks } from '@unlock-protocol/networks'
import { Button } from '@unlock-protocol/ui'
import React, { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ToastHelper } from '~/components/helpers/toast.helper'
import {
  ONE_DAY_IN_SECONDS,
  UNLIMITED_KEYS_COUNT,
  UNLIMITED_KEYS_DURATION,
} from '~/constants'
import { useAuth } from '~/contexts/AuthenticationContext'
import { CreateLockForm, LockFormProps } from './elements/CreateLockForm'
import { CreateLockFormSummary } from './elements/CreateLockFormSummary'
import { BsArrowLeft as ArrowBack } from 'react-icons/bs'
import { useRouter } from 'next/router'

export type Step = 'data' | 'summary' | 'deploy'

interface CreateLockSummaryProps {
  formData: LockFormProps
  setStep: (step: Step, data: LockFormProps) => void
  onSubmit: (data: LockFormProps) => void
}

interface CreateLockProps {
  onSubmit: (data: LockFormProps) => void
  defaultValues: LockFormProps
}
interface StatusMappingProps {
  title: string
  backUrl: Step | null
}

const TITLE_BY_STATUS_MAPPING: Record<Step, StatusMappingProps> = {
  data: {
    title: 'Create a Lock',
    backUrl: null,
  },
  summary: {
    title: 'Create a Lock',
    backUrl: 'data',
  },
  deploy: {
    title: 'Deploying Lock',
    backUrl: null,
  },
}

export const CreateLockSteps = () => {
  const { getWalletService } = useAuth()
  const [step, setStep] = useState<Step>('data')
  const [values, setValues] = useState<LockFormProps | undefined>(undefined)
  const [lockAddress, setLockAddress] = useState<string | undefined>(undefined)
  const [transactionHash, setTransactionHash] = useState<string | undefined>(
    undefined
  )
  const { title, backUrl } = TITLE_BY_STATUS_MAPPING[step]
  const router = useRouter()

  const changeStep = (step: Step, data?: LockFormProps) => {
    setStep(step)
    setValues(data)
  }

  const onFormSubmit = (data: LockFormProps) => {
    changeStep('summary', data)
  }

  const onSummarySubmit = async (data: LockFormProps) => {
    const address = await createLockMutation.mutateAsync(data)
    setLockAddress(address)
  }

  const createLockMutation = useMutation(
    async ({
      name,
      unlimitedDuration,
      unlimitedQuantity,
      keyPrice,
      currencyContractAddress,
      maxNumberOfKeys,
      expirationDuration,
      network,
    }: LockFormProps) => {
      const walletService = await getWalletService(network)
      const expirationInSeconds =
        (expirationDuration as number) * ONE_DAY_IN_SECONDS
      const lockAddress = await walletService.createLock(
        {
          name,
          expirationDuration: unlimitedDuration
            ? UNLIMITED_KEYS_DURATION
            : expirationInSeconds,
          maxNumberOfKeys: unlimitedQuantity
            ? UNLIMITED_KEYS_COUNT
            : maxNumberOfKeys,
          currencyContractAddress,
          keyPrice: keyPrice?.toString(),
          publicLockVersion: networks[network].publicLockVersionToDeploy,
        },
        {},
        (error: any, transactionHash) => {
          if (error) {
            console.error(error)
            ToastHelper.error(
              'Unexpected issue on lock creation, please try again'
            )
          } else {
            setTransactionHash(transactionHash!) // keep transaction hash to retrieve transaction details
            changeStep('deploy', values)
          }
        }
      )
      return lockAddress
    },
    {
      onError: (error) => {
        console.error(error)
        ToastHelper.error('Unexpected issue on lock creation, please try again')
      },
    }
  )

  const onBack = () => {
    if (!backUrl) {
      router?.back()
    } else {
      setStep(backUrl)
    }
  }

  const Step = () => {
    switch (step) {
      case 'data': {
        return <CreateLock onSubmit={onFormSubmit} defaultValues={values!} />
      }

      case 'summary': {
        return (
          <CreateLockSummary
            setStep={setStep}
            formData={values!}
            onSubmit={onSummarySubmit}
          />
        )
      }

      case 'deploy': {
        return (
          <CreateLockFormSummary
            formData={values!}
            lockAddress={lockAddress}
            transactionHash={transactionHash}
            showStatus
          />
        )
      }

      default: {
        return null
      }
    }
  }

  const showBackUrl = step !== 'deploy'

  return (
    <div>
      <div className="grid items-center grid-cols-6 md:grid-cols-3">
        <div className="col-auto">
          {showBackUrl && (
            <ArrowBack size={20} className="cursor-pointer" onClick={onBack} />
          )}
        </div>
        <h1 className="col-span-4 text-lg font-semibold text-center md:col-auto md:text-xl">
          {title}
        </h1>
      </div>
      <div className="pt-8 md:pt-14">{Step()}</div>
    </div>
  )
}

const CreateLock = ({ onSubmit, defaultValues }: CreateLockProps) => {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-28">
        <div className="flex-col hidden mx-auto md:flex md:max-w-lg">
          <h4 className="mb-4 text-5xl font-bold">
            Deploy your membership contract
          </h4>
          <span className="text-lg font-normal">
            For creative communities and the humans who build them
          </span>
          <img
            className="mt-9"
            src="/images/svg/create-lock/members.svg"
            alt="Create lock members"
          />
        </div>
        <div className="md:max-w-lg">
          <CreateLockForm onSubmit={onSubmit} defaultValues={defaultValues} />
        </div>
      </div>
    </div>
  )
}

const CreateLockSummary = ({
  formData,
  setStep,
  onSubmit,
}: CreateLockSummaryProps) => {
  const onHandleSubmit = () => {
    if (typeof onSubmit === 'function') {
      onSubmit(formData)
    }
  }
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-28">
        <div className="flex flex-col md:mx-auto md:max-w-lg">
          <h4 className="mb-4 text-3xl font-bold md:text-5xl md:block">
            Ready to deploy?
          </h4>
          <span className="text-lg font-normal">
            Here is the overview of your Lock
          </span>
          <img
            className="hidden max-w-xs mt-28 md:block"
            src="/images/svg/create-lock/lock.svg"
            alt="Create Lock image"
          />
        </div>
        <div className="md:max-w-lg">
          <CreateLockFormSummary formData={formData} />
          <div className="flex flex-col justify-between w-full gap-4 mt-8 md:mt-12 md:px-12">
            <Button onClick={onHandleSubmit}>Looks good to me</Button>
            <Button
              variant="transparent"
              onClick={() => setStep('data', formData)}
            >
              Change
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
