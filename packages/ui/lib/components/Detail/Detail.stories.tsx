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
    append: <span className="text-xs">append value</span>,
    prepend: <span className="text-xs">prepend value</span>,
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
    append: null,
    prepend: null,
  },
} satisfies Story

export const DetailWithIcon = {
  args: {
    ...Standard.args,
    inline: false,
    append: null,
    prepend: null,
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
