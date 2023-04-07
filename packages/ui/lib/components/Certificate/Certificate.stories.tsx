import { Certificate } from './Certificate'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  component: Certificate,
  title: 'Certificate',
} satisfies Meta<typeof Certificate>

export default meta
type Story = StoryObj<typeof meta>

export const CertificateBase = {
  args: {
    name: 'Example Certification',
    description: 'Lorem ipsum',
    owner: '0xF3850C690BFF6c1E343D2449bBbbb00b0E934f7b',
    issuer: 'One Piece',
    network: 5,
    tokenId: 88,
    lockAddress: '0x',
    transactionsHash: '0x',
    issueDate: '1 Jan 2024',
    image:
      'https://www.pngkit.com/png/detail/99-993245_atrc-certified-logo-certification.png',
    externalUrl: 'https://example.it',
  },
} satisfies Story

export const CertificateWithBadge = {
  args: {
    badge: 'Sample',
    name: 'Example Certification',
    description: 'Lorem ipsum',
    owner: '0xF3850C690BFF6c1E343D2449bBbbb00b0E934f7b',
    issuer: 'One Piece',
    network: 5,
    tokenId: 88,
    lockAddress: '0x',
    transactionsHash: '0x',
    issueDate: '1 Jan 2024',
    image:
      'https://www.pngkit.com/png/detail/99-993245_atrc-certified-logo-certification.png',
    externalUrl: 'https://example.it',
  },
} satisfies Story
