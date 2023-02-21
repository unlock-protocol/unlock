import { ImageUpload } from './ImageUpload'
import { StoryFn, Meta } from '@storybook/react'

export default {
  component: ImageUpload,
  title: 'ImageUpload',
} as Meta<typeof ImageUpload>

const Template: StoryFn<typeof ImageUpload> = (args) => (
  <ImageUpload {...args} />
)

export const Primary = Template.bind({})

Primary.args = {
  preview: '/images/image_upload.png',
  description:
    'Upload an image or select an external URL. Recommend using a square of at least 300x300 pixels.',
}
