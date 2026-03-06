import { Button, Drawer, Select, Input, ToastHelper } from '@unlock-protocol/ui'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import DynamicFormForAttestations from './DynamicForAttestations'
import { createOffchainAttestation } from '~/hooks/useAttestation'

interface CreateAttestationDrawerProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  lockAddress: string
  network: number
  owner: string
}

// Schema on Base Sepolia
const schemaOptions = [
  {
    label: 'Basic',
    value: 'string firstName,string lastName',
    description: 'First and Last name',
    easContract:
      '0x3a9923db8a119d3bd312ca18781631c2f96fe5d31e67b437eb919148bfd84be6',
  },
  {
    label: 'Basic + DoB',
    value: 'string firstName,string lastName,uint256 dateOfBirth',
    description: 'first, last and date of birth',
    easContract:
      '0x004a80c4973162c783eda1d78e2198ab2bf0199c96056d2f44d8748b9319ad12',
  },
  {
    label: 'Grades',
    value: 'string firstName,string lastName,uint256 dateOfBirth,string grade',
    description: 'All plus grades',
    easContract:
      '0x229e4b0ce3dbc4ef5b5fba829f8500bddb855dca1cf294ef3bf2df20b2d6922a',
  },
  {
    label: 'Grades & Thesis',
    value:
      'string firstName,string lastName,uint256 dateOfBirth,string grade,string thesis',
    description: 'All plus grades and thesis',
    easContract:
      '0x36846966b1e5780c7fb1c59c03d4aa61ecfaee0e4d123847c96adc40d7260633',
  },
]

const CreateAttestationDrawer = ({
  isOpen,
  setIsOpen,
  lockAddress,
  network,
  owner,
}: CreateAttestationDrawerProps) => {
  const [selectedSchema, setSelectedSchema] = useState<string>(
    schemaOptions[0].value
  )

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<Record<string, unknown>>()

  const onSubmit = async (data: any) => {
    const selectedSchemaOption = schemaOptions.find(
      (opt) => opt.value === selectedSchema
    )

    if (selectedSchemaOption) {
      const attestationPromise = createOffchainAttestation(
        selectedSchemaOption,
        data,
        lockAddress,
        network,
        owner
      )

      try {
        await attestationPromise
        ToastHelper.success('Attestation created successfully')
        // Close drawer only on success
        setIsOpen(false)
      } catch (error) {
        // Show error toast but keep drawer open so user can try again
        ToastHelper.error('Error creating attestation')
        console.error('Error creating the attestation:', error)
      }
    }
  }

  return (
    <Drawer title="Create Attestation" isOpen={isOpen} setIsOpen={setIsOpen}>
      <p className="mb-6">
        An attestation is a document that certifies you have completed a
        certification or own a key. It contains more personal data, such as
        name, date of birth or anything else.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Select
          label="Select the personal data schema on the attestation:"
          options={schemaOptions}
          defaultValue={schemaOptions[0].value}
          onChange={(value) => setSelectedSchema(value as string)}
        />

        <DynamicFormForAttestations
          schema={selectedSchema}
          register={register}
          errors={errors}
        />

        <div>
          <h3 className="text-base font-semibold mb-4">Recipient (opt.)</h3>
          <Input
            label="Email"
            type="email"
            placeholder="Enter email"
            {...register('email')}
          />
        </div>

        <Button type="submit" loading={isSubmitting} className="w-full">
          Create & Send
        </Button>
      </form>
    </Drawer>
  )
}

export default CreateAttestationDrawer
