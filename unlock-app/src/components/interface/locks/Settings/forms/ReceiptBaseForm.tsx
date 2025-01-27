import { Placeholder, TextBox, ToggleSwitch } from '@unlock-protocol/ui'
import { Input, Button } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import {
  useGetReceiptsBase,
  useReceiptsStatus,
  useUpdateReceiptsBase,
} from '~/hooks/useReceipts'
import { z } from 'zod'
import { locksmith } from '~/config/locksmith'
import { getAccessToken } from '~/utils/session'
import { getFormattedTimestamp } from '~/utils/dayjs'
import { config } from '~/config/app'
import axios from 'axios'
import { TbReceipt as ReceiptIcon } from 'react-icons/tb'
import { graphService } from '~/config/subgraph'

const SupplierSchema = z.object({
  prefix: z.string().optional(),
  vat: z.string().optional(),
  vatRatePercentage: z.number().nullish().default(null),
  supplierName: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zip: z.string().optional(),
  servicePerformed: z.string().optional(),
})

type SupplierBodyProps = z.infer<typeof SupplierSchema>
interface ReceiptBaseFormProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
}

const ReceiptBaseFormPlaceholder = () => {
  return (
    <Placeholder.Root className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Placeholder.Line size="xl" />
      <Placeholder.Root className="grid grid-cols-1 col-span-2 gap-4 md:grid-cols-2">
        <Placeholder.Line size="xl" />
        <Placeholder.Line size="xl" />
      </Placeholder.Root>
      <Placeholder.Line size="xl" />
      <Placeholder.Line size="xl" />
      <Placeholder.Line size="xl" />
      <Placeholder.Line size="xl" />
      <Placeholder.Line size="xl" />
      <Placeholder.Line size="xl" />
    </Placeholder.Root>
  )
}

const ExportReceipts = ({
  network,
  lockAddress,
}: {
  network: number
  lockAddress: string
}) => {
  const [shouldRefetch, setShouldRefetch] = useState(false)
  const [isExportDisabled, setIsExportDisabled] = useState(false)

  const {
    data: jobs,
    isLoading,
    error,
  } = useReceiptsStatus(network, lockAddress, shouldRefetch)

  let isPending = false
  let lastExportDate = null
  let downloadLink = null

  if (!isLoading && !error && jobs) {
    if (jobs.length === 1) {
      const job = jobs[0]
      if (job.payload.status === 'pending') {
        isPending = true
      } else {
        lastExportDate = job.updatedAt
        lastExportDate = lastExportDate && getFormattedTimestamp(lastExportDate)
      }
    } else if (jobs.length === 2) {
      // there is either 2 successful jobs or 1 successful 1 pending, either way it's safe to download
      if (jobs[0].payload.status === 'pending') {
        isPending = true
        lastExportDate = jobs[1].updatedAt
      } else {
        lastExportDate = jobs[0].updatedAt
      }
      lastExportDate = lastExportDate && getFormattedTimestamp(lastExportDate)
    }
    downloadLink = lastExportDate && (
      <p>
        Last export:{' '}
        <a
          onClick={downloadZip}
          className="font-bold underline text-[#603DEB] hover:cursor-pointer"
        >
          {lastExportDate}
        </a>
      </p>
    )
  }

  async function checkExportPossible() {
    try {
      const receipts = await graphService.receipts(
        {
          where: {
            lockAddress,
          },
        },
        {
          networks: [network],
        }
      )

      if (!receipts.length) {
        setIsExportDisabled(true)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    checkExportPossible()
  }, [lockAddress, network])

  useEffect(() => {
    if (jobs && isPending) {
      setShouldRefetch(true)
    } else {
      setShouldRefetch(false)
    }
  }, [jobs])

  async function handleExport() {
    try {
      const { data } = await locksmith.createDownloadReceiptsRequest(
        network,
        lockAddress
      )
      if (data.status === 'pending') {
        ToastHelper.success('Export started!')
        setShouldRefetch(true)
      }
    } catch (error) {
      ToastHelper.error('Could not start export')
    }
  }

  async function downloadZip() {
    const accessToken = getAccessToken()
    if (!accessToken) {
      return
    }

    const locksmithURI = config.locksmithHost
    const downloadUrl = `${locksmithURI}/v2/receipts/download/${network}/${lockAddress}`

    try {
      const response = await axios.get(downloadUrl, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'receipts.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      ToastHelper.success('Download successful!')
    } catch (error) {
      ToastHelper.error('Could not download receipts')
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <Button
        variant="outlined-primary"
        size="small"
        onClick={handleExport}
        loading={shouldRefetch}
        disabled={isExportDisabled}
        iconLeft={<ReceiptIcon />}
      >
        Export Receipts
      </Button>
      {downloadLink}
    </div>
  )
}

export const ReceiptBaseForm = ({
  lockAddress,
  isManager,
  disabled,
  network,
}: ReceiptBaseFormProps) => {
  const [vatPercentage, setVatPercentage] = useState(false)
  const [prefix, setPrefix] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isValid, errors },
  } = useForm<SupplierBodyProps>({
    mode: 'onChange',
  })

  const { data: receiptsBase, isLoading: isLoadingDetails } =
    useGetReceiptsBase({
      lockAddress,
      network,
      isManager,
    })

  const {
    mutateAsync: receiptBaseMutation,
    isPending: isReceiptsBaseUpdating,
  } = useUpdateReceiptsBase({
    lockAddress,
    network,
    isManager,
  })

  const onHandleSubmit = async (data: SupplierBodyProps) => {
    if (isValid) {
      await ToastHelper.promise(receiptBaseMutation(data), {
        loading: 'Updating  supplier details.',
        success: 'Supplier updated',
        error: 'We could not update the details.',
      })
    } else {
      ToastHelper.error('Form is not valid')
      reset()
    }
  }

  useEffect(() => {
    if (receiptsBase) {
      reset(receiptsBase)
      setVatPercentage(receiptsBase?.vatRatePercentage > 0) // enable when percentage is set
      setPrefix(receiptsBase?.prefix?.length > 0)
    }
  }, [receiptsBase, reset])

  const disabledInput = isReceiptsBaseUpdating || disabled || isLoadingDetails

  if (isLoadingDetails) {
    return <ReceiptBaseFormPlaceholder />
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <ExportReceipts network={network} lockAddress={lockAddress} />
      </div>
      <form
        className="grid grid-cols-1 gap-6 pt-6 text-left"
        onSubmit={handleSubmit(onHandleSubmit)}
      >
        <div className="grid grid-cols-1 gap-2 md:gap-4 md:grid-cols-2">
          <Input
            disabled={disabledInput}
            label="Supplier name"
            {...register('supplierName')}
          />
          <div>
            <div className="flex items-center justify-between">
              <label className="px-1 text-base" htmlFor="">
                Receipt prefix
              </label>
              <ToggleSwitch
                title="Enable"
                enabled={prefix}
                setEnabled={setPrefix}
                onChange={(enabled) => {
                  if (!enabled) {
                    setValue('prefix', '', {
                      shouldValidate: true,
                    })
                  }
                }}
              />
            </div>
            <Input
              type="text"
              maxLength={6}
              step="any"
              disabled={disabledInput || !prefix}
              error={errors?.prefix?.message}
              {...register('prefix', {
                onChange: (e) =>
                  setValue('prefix', e.target.value.toUpperCase()),
                required: {
                  value: prefix,
                  message: 'This value is required.',
                },
              })}
            />
          </div>
          <div className="grid grid-cols-1 col-span-2 gap-4 md:grid-cols-2">
            <div className="mt-1">
              <Input
                disabled={disabledInput}
                label="VAT number"
                {...register('vat')}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="px-1 text-base" htmlFor="">
                  VAT rate (%)
                </label>
                <ToggleSwitch
                  title="Enable"
                  enabled={vatPercentage}
                  setEnabled={setVatPercentage}
                  onChange={(enabled) => {
                    if (!enabled) {
                      setValue('vatRatePercentage', null, {
                        shouldValidate: true,
                      })
                    }
                  }}
                />
              </div>
              <Input
                type="number"
                min={0}
                max={100}
                step="any"
                disabled={disabledInput || !vatPercentage}
                error={errors?.vatRatePercentage?.message}
                {...register('vatRatePercentage', {
                  valueAsNumber: true,
                  required: {
                    value: vatPercentage,
                    message: 'This value is required.',
                  },
                })}
              />
            </div>
          </div>
          <Input
            disabled={disabledInput}
            label="Address line 1"
            {...register('addressLine1')}
          />
          <Input
            disabled={disabledInput}
            label="Address line 2"
            {...register('addressLine2')}
          />
          <Input disabled={disabledInput} label="City" {...register('city')} />
          <Input
            disabled={disabledInput}
            label="State"
            {...register('state')}
          />
          <Input disabled={disabledInput} label="Zip" {...register('zip')} />
          <Input
            disabled={disabledInput}
            label="Country"
            {...register('country')}
          />
          <div className="col-span-2">
            <TextBox
              disabled={disabledInput}
              label="Service performed"
              {...register('servicePerformed')}
            />
          </div>
        </div>

        {isManager && (
          <Button
            type="submit"
            className="w-full md:w-1/3"
            disabled={disabledInput}
            loading={isReceiptsBaseUpdating}
          >
            Update
          </Button>
        )}
      </form>
    </div>
  )
}
