// import {
//   Controller,
//   FormProvider,
//   useFieldArray,
//   useForm,
//   useFormContext,
// } from 'react-hook-form'
import { z } from 'zod'

import {
  Button,
  Disclosure,
  Input,
  TextBox,
  Select,
  ToggleSwitch,
  ImageUpload,
  AddressInput,
  isAddressOrEns,
} from '@unlock-protocol/ui'
import { useAuth } from '~/contexts/AuthenticationContext'
import { Controller, useForm, useWatch } from 'react-hook-form'

// TODO: once we have saved checkout config, use the metadata fields from there.
// In the meantime, use email + wallet address
const rsvpForm = z.object({
  email: z
    .string({
      description: 'Email address that will receive the QR code.',
    })
    .default(''),
  recipient: z
    .string({
      description: 'Wallet that will receive the ticket NFT.',
    })
    .default(''),
})

type RsvpFormProps = z.infer<typeof rsvpForm>

export const WalletlessRegistration = () => {
  const { account } = useAuth()

  const localForm = useForm<RsvpFormProps>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      recipient: account,
    },
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = localForm

  const onSubmit = async (form: RsvpFormProps) => {
    console.log('SUBMITTED!')
    console.log(form)
    // Let's just use the walletless airdrop API from there!
    // const params = await emailPreviewData()
    // const promise = wedlocksService.sendEmail(
    //   templateId as any,
    //   form.email,
    //   params,
    //   [] // attachments
    // )
    // await ToastHelper.promise(promise, {
    //   loading: 'Sending email preview...',
    //   success: 'Email preview sent.',
    //   error: `Can't send email preview`,
    // })
    // setShowPreview(false) // close modal after email is sent
  }

  const { recipient = '' } = useWatch({
    control,
  })

  return (
    <div className="grid gap-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col w-full gap-6 py-4"
      >
        <Input
          {...register('email', {
            required: {
              value: true,
              message: 'This field is required.',
            },
          })}
          type="email"
          placeholder="your@email.com"
          label="Email address"
          description={
            'Please enter your email address to get a QR code by email.'
          }
          error={errors?.email?.message}
        />
        <Controller
          name="recipient"
          control={control}
          rules={{
            validate: (address: string) => {
              return !address || isAddressOrEns(address)
            },
          }}
          render={() => {
            return (
              <>
                <AddressInput
                  value={recipient}
                  withIcon
                  placeholder="0x..."
                  label="Your wallet address (or ENS)"
                  onChange={(value: any) => {
                    setValue('recipient', value)
                  }}
                  description={
                    'You will receive your NFT ticket on this wallet.'
                  }
                  error={errors?.recipient?.message}
                />
              </>
            )
          }}
        />

        <Button type="submit">RSVP</Button>
      </form>
    </div>
  )
}
