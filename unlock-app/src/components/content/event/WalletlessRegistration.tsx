import { Input } from 'postcss'
// import {
//   Controller,
//   FormProvider,
//   useFieldArray,
//   useForm,
//   useFormContext,
// } from 'react-hook-form'
import {
  Button,
  Disclosure,
  Input,
  TextBox,
  Select,
  ToggleSwitch,
  ImageUpload,
} from '@unlock-protocol/ui'

export const WalletlessRegistration = () => {
  // TODO: once we have saved checkout config, use the metadata fields from there.
  // In the meantime, use email + first name + last name
  return (
    <div className="grid gap-6">
      <Input
        {...register('email', {
          required: {
            value: true,
            message: 'An email address is required',
          },
        })}
        type="text"
        placeholder="Name"
        label="Event Name"
        description={
          'Enter the name of your event. It will appear on the NFT tickets.'
        }
        error={errors.lock?.name?.message}
      />
    </div>
  )
}
