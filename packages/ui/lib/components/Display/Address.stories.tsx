import { Meta, StoryFn } from '@storybook/react'
import { Address, AddressProps } from './Address'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient()

const withQueryClient = (Story: StoryFn) => (
  <QueryClientProvider client={queryClient}>
    <Toaster position="top-center" />
    <Story />
  </QueryClientProvider>
)

export default {
  title: 'Address',
  component: Address,
  argTypes: {
    address: { control: 'text' },
    showExternalLink: { control: 'boolean' },
    showCopyIcon: { control: 'boolean' },
    showENSName: { control: 'boolean' },
    minified: { control: 'boolean' },
  },
  decorators: [withQueryClient],
} as Meta

const Template: StoryFn<AddressProps> = (args) => <Address {...args} />

// Default Address render
export const Default = Template.bind({})
Default.args = {
  address: '0xf5c28ce24acf47849988f147d5c75787c0103534',
  showExternalLink: true,
  showCopyIcon: true,
  minified: true,
}

// Address without external link
export const WithoutExternalLink = Template.bind({})
WithoutExternalLink.args = {
  address: '0xf5c28ce24acf47849988f147d5c75787c0103534',
  showExternalLink: false,
  showCopyIcon: true,
  minified: true,
}

// Address without copy icon
export const WithoutCopyIcon = Template.bind({})
WithoutCopyIcon.args = {
  address: '0xf5c28ce24acf47849988f147d5c75787c0103534',
  showExternalLink: true,
  showCopyIcon: false,
  minified: true,
}

// Address only
export const AddressOnly = Template.bind({})
AddressOnly.args = {
  address: '0xf5c28ce24acf47849988f147d5c75787c0103534',
  showExternalLink: false,
  showCopyIcon: false,
  showENSName: false,
  minified: true,
}

// Full address
export const FullAddress = Template.bind({})
FullAddress.args = {
  address: '0xf5c28ce24acf47849988f147d5c75787c0103534',
  showExternalLink: true,
  showCopyIcon: true,
  showENSName: false,
  minified: false,
}

// Minified address
export const MinifiedAddress = Template.bind({})
MinifiedAddress.args = {
  address: '0xf5c28ce24acf47849988f147d5c75787c0103534',
  showExternalLink: true,
  showCopyIcon: true,
  showENSName: false,
  minified: true,
}
