import { Meta, StoryFn } from '@storybook/react'
import { Address, AddressProps } from './Address'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

const withQueryClient = (Story: StoryFn) => (
  <QueryClientProvider client={queryClient}>
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
    showResolvedName: { control: 'boolean' },
    minified: { control: 'boolean' },
  },
  decorators: [withQueryClient],
} as Meta

const Template: StoryFn<AddressProps> = (args) => <Address {...args} />

// Mock name resolution function for multiple names
const mockUseMultipleNames = async (
  address: string
): Promise<string | undefined> => {
  const names: Record<string, string> = {
    '0xf5c28ce24acf47849988f147d5c75787c0103534': 'unlock-protocol.eth',
    '0x1234567890123456789012345678901234567890': 'unlock-protocol.cb.id',
    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd': 'unlock-protocol.base.eth',
  }
  return names[address] || undefined
}

// Default Address render
export const Default = Template.bind({})
Default.args = {
  address: '0xf5c28ce24acf47849988f147d5c75787c0103534',
  showExternalLink: true,
  showCopyIcon: true,
  showResolvedName: true,
  minified: true,
  useName: mockUseMultipleNames, // Using the mock function to resolve names
  onCopied: () => console.log('Address copied'), // Callback for clipboard action
}

// Address without external link
export const WithoutExternalLink = Template.bind({})
WithoutExternalLink.args = {
  ...Default.args,
  showExternalLink: false,
}

// Address without copy icon
export const WithoutCopyIcon = Template.bind({})
WithoutCopyIcon.args = {
  ...Default.args,
  showCopyIcon: false,
}

// Address only
export const AddressOnly = Template.bind({})
AddressOnly.args = {
  ...Default.args,
  showExternalLink: false,
  showCopyIcon: false,
  showResolvedName: false,
}

// Full address
export const FullAddress = Template.bind({})
FullAddress.args = {
  ...Default.args,
  showResolvedName: false,
  minified: false,
}

// Minified address
export const MinifiedAddress = Template.bind({})
MinifiedAddress.args = {
  ...Default.args,
  showResolvedName: false,
}

// With multiple name resolutions
export const WithMultipleNameResolutions = Template.bind({})
WithMultipleNameResolutions.args = {
  ...Default.args,
  useName: mockUseMultipleNames,
}

// Resolved cb.id name
export const WithCBID = Template.bind({})
WithCBID.args = {
  ...Default.args,
  address: '0x1234567890123456789012345678901234567890',
  useName: mockUseMultipleNames,
}

// Resolved base.eth name
export const WithBaseETH = Template.bind({})
WithBaseETH.args = {
  ...Default.args,
  address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
  useName: mockUseMultipleNames,
}
