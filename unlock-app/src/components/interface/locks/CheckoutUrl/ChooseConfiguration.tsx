import { classed } from '@tw-classed/react'
import { PaywallConfig } from '~/unlockTypes'
import React, { useState } from 'react'
import { RadioGroup } from '@headlessui/react'
import { Input, Select } from '@unlock-protocol/ui'

const RadioContentWrapper = classed.div('grid grid-cols-[24px_1fr] gap-2')

export interface CheckoutConfig {
  id: string | null
  name: string
  config: PaywallConfig
}

interface ChooseConfigurationProps {
  items: CheckoutConfig[]
  onChange(config: CheckoutConfig): void
  value: CheckoutConfig
  disabled?: boolean
}

type Configuration = 'new' | 'existing'

const Radio = ({ checked }: any) => {
  return (
    <div className="flex items-center justify-center w-5 h-5 border-2 rounded-full border-brand-ui-primary">
      {checked && (
        <div className="w-3 h-3 rounded-full bg-brand-ui-primary"></div>
      )}
    </div>
  )
}

export function ChooseConfiguration({
  items,
  onChange,
  value,
  disabled,
}: ChooseConfigurationProps) {
  const [configuration, setConfiguration] = useState<Configuration>('new')
  const [selectedConfig, setSelectedConfig] = useState<
    CheckoutConfig | undefined
  >(undefined)

  const configOptions = items?.map((config) => {
    return {
      label: config.name,
      value: `${config.id}`,
    }
  })

  const onSelectConfig = (configId: string | number) => {
    const config = items.find((item) => item.id === configId)
    setSelectedConfig(config)

    if (config) {
      onChange(config)
    }
  }
  return (
    <RadioGroup
      className="grid gap-6"
      value={configuration}
      onChange={setConfiguration}
      disabled={disabled}
    >
      <RadioGroup.Option value="new">
        {({ checked }) => (
          <div className="flex flex-col gap-2">
            <RadioContentWrapper className="items-center">
              <Radio checked={checked} />
              <span>Create a new one</span>
            </RadioContentWrapper>
            <RadioContentWrapper>
              <div className="col-start-2">
                <Input placeholder="Enter name" />
              </div>
            </RadioContentWrapper>
          </div>
        )}
      </RadioGroup.Option>
      <RadioGroup.Option value="existing">
        {({ checked }) => (
          <div className="flex flex-col gap-2">
            <RadioContentWrapper className="items-center">
              <Radio checked={checked} />
              <span>Choose existing</span>
            </RadioContentWrapper>
            <RadioContentWrapper>
              <div className="col-start-2">
                <Select
                  disabled={!checked}
                  options={configOptions}
                  onChange={(value) => {
                    onSelectConfig(value?.toString())
                  }}
                  defaultValue={selectedConfig?.id}
                />
              </div>
            </RadioContentWrapper>
          </div>
        )}
      </RadioGroup.Option>
    </RadioGroup>
  )
}
