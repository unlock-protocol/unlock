import { Select } from './Select'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  component: Select,
  title: 'Select',
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const SelectComponent = {
  args: {
    label: 'Select your option',
    tooltip: (
      <>
        <p>There is a tooltip.</p>
        <p> This is a vary long one to see wghat we can do!</p>
      </>
    ),
    description: <>description example</>,
    customOption: true,
    options: [
      {
        label: 'Test 1',
        value: 1,
        prepend: (
          <div className="flex items-center justify-center w-5 bg-gray-100">
            T1
          </div>
        ),
        append: 'append test 1',
      },
      {
        label: 'Test 2',
        value: 2,
        prepend: (
          <div className="flex items-center justify-center w-5 bg-gray-100">
            T2
          </div>
        ),
        append: 'append test 2',
      },
      {
        label: 'Test 3',
        value: 3,
        disabled: true,
      },
      {
        label: 'Test 4',
        value: 3,
        disabled: true,
      },
    ],
    moreOptions: [
      {
        label: 'Test 5',
        value: 3,
        disabled: true,
      },
      {
        label: 'Test 6',
        value: 3,
        disabled: true,
      },
      {
        label: 'Test 7',
        value: 3,
        disabled: true,
      },
      {
        label: 'Test 8',
        value: 3,
        disabled: true,
      },
      {
        label: 'Test 9',
        value: 3,
        disabled: true,
      },
      {
        label: 'Test 10',
        value: 3,
        disabled: true,
      },
    ],
  },
} satisfies Story
