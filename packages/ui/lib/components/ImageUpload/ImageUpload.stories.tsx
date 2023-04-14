import { ImageUpload } from './ImageUpload'
import { StoryObj, Meta } from '@storybook/react'

const meta = {
  component: ImageUpload,
  title: 'ImageUpload',
} satisfies Meta<typeof ImageUpload>

export default meta
type Story = StoryObj<typeof meta>

export const Primary = {
  args: {
    preview: '/images/image_upload.png',
    description:
      'Upload an image or select an external URL. Recommend using a square of at least 300x300 pixels.',
  },
} satisfies Story

export const Loading = {
  args: {
    preview: '/images/image_upload.png',
    description:
      'Upload an image or select an external URL. Recommend using a square of at least 300x300 pixels.',
    isUploading: true,
  },
}

export const CoverImage = {
  args: {
    preview: '/images/image_upload.png',
    description:
      'Upload an image or select an external URL. We recommend using a square of at least 600x200 pixels.',
    imageRatio: 'cover',
  },
} satisfies Story

export const CoverImageLoading = {
  args: {
    preview: '/images/image_upload.png',
    description:
      'Upload an image or select an external URL. We recommend using a square of at least 600x200 pixels.',
    imageRatio: 'cover',
    isUploading: true,
  },
} satisfies Story
