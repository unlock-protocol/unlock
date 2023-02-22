import { Detail } from './Detail'
import { Meta, StoryObj } from '@storybook/react'
import { MdShare } from 'react-icons/md'

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
    value: 100,
  },
} satisfies Story

export const DetailSimple = {
  args: {
    ...Standard.args,
  },
} satisfies Story

export const DetailInline = {
  args: {
    ...Standard.args,
    inline: false,
  },
} satisfies Story

export const DetailWithIcon = {
  args: {
    ...Standard.args,
    inline: false,
    icon: MdShare,
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
    value: (
      <div className="flex items-center gap-2">
        <span className="text-xs">append value</span>
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
    value: (
      <div className="flex items-center gap-2">
        <span className="text-xs">append value</span>
        <span className="font-bold">value</span>
        <span className="text-xs">prepend value</span>
      </div>
    ),
  },
}
