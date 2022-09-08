import { Button } from '@unlock-protocol/ui'
import { useState } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { CreateLockForm } from './elements/CreateLockForm'
import { CreateLockFormSummary } from './elements/CreateLockFormSummary'
import { LockFormProps } from './useCreateLock'

type Step = 'data' | 'summary' | 'deploy'

export const CreateLockSteps = () => {
  const { network } = useAuth()
  const [step, setStep] = useState<Step>('data')
  const [values, setValues] = useState<LockFormProps | undefined>(undefined)

  const changeStep = (step: Step, data?: LockFormProps) => {
    setStep(step)
    setValues(data)
  }

  const onFormSubmit = (data: any) => {
    changeStep('summary', data)
  }

  return (
    <div>
      {step === 'data' && <CreateLock onSubmit={onFormSubmit} />}
      {step === 'summary' && (
        <div>
          <CreateLockSummary
            setStep={setStep}
            lock={values}
            network={network}
          />
        </div>
      )}
    </div>
  )
}

const CreateLock = ({ onSubmit }: any) => {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-28 pt-14">
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
          <CreateLockForm onSubmit={onSubmit} />
        </div>
      </div>
    </div>
  )
}

const CreateLockSummary = ({ lock, network, setStep }: any) => {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-28 pt-14">
        <div className="flex flex-col mx-auto md:max-w-lg">
          <h4 className="mb-4 text-5xl font-bold">Ready to deploy?</h4>
          <span className="text-lg font-normal">
            Here is the overview of your Lock
          </span>
          <img
            className="hidden mt-9 md:block"
            src="/images/svg/lock.svg"
            alt=""
          />
        </div>
        <div className="md:max-w-lg">
          <CreateLockFormSummary lock={lock} network={network} />
          <div className="flex flex-col justify-between w-full gap-4 px-12 mt-12">
            <Button>Look good for me</Button>
            <span
              className="font-bold text-center cursor-pointer"
              onClick={() => setStep('data')}
            >
              Back to Edit
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
