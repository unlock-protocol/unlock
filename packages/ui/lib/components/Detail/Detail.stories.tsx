import { Detail } from './Detail'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Detail',
  component: Detail,
  args: {},
} satisfies Meta<typeof Detail>

export default meta
type Story = StoryObj<typeof meta>

export const Standard = {
  args: {
    label: 'Title',
    children: 100,
  },
} satisfies Story

export const DetailLoading = {
  args: {
    ...Standard.args,
    loading: true,
  },
} satisfies Story

export const DetailLoadingNotInline = {
  args: {
    ...Standard.args,
    loading: true,
    inline: false,
  },
} satisfies Story

export const DetailWithReactNode = {
  args: {
    ...Standard.args,
    label: (
      <div className="flex flex-col gap-2">
        <div className="text-red-500 font-xl">Custom label</div>
        <span>subtitle</span>
      </div>
    ),
    children: (
      <div className="flex items-center gap-2">
        <span className="text-xs font-normal">append value</span>
        <span className="font-bold">value</span>
        <span className="text-xs">prepend value</span>
      </div>
    ),
  },
}

export const DetailWithReactNodeInline = {
  args: {
    ...Standard.args,
    inline: true,
    children: (
      <div className="flex items-center gap-2">
        <span className="text-xs">append value</span>
        <span className="font-bold">value</span>
        <span className="text-xs">prepend value</span>
      </div>
    ),
  },
}
