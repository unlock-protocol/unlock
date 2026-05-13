import { Certificate } from './Certificate'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  component: Certificate,
  title: 'Certification',
} satisfies Meta<typeof Certificate>

export default meta
type Story = StoryObj<typeof meta>

const certificateWithRecipientDetailsArgs = {
  name: 'Unlock Certification Builder',
  description:
    'Awarded for completing the Unlock certification workshop, including lock setup, airdrop delivery, metadata review, and credential sharing. This description intentionally spans multiple sentences so the certificate preview can exercise long-form wrapping without crowding the issuer panel or the verification details.',
  owner: 'Ada Lovelace',
  issuer: 'Unlock Labs',
  network: 8453,
  tokenId: 2026,
  lockAddress: '0xF3850C690BFF6c1E343D2449bBbbb00b0E934f7b',
  transactionsHash: '0x0dEADBEEF1234567890abcdef1234567890abcdef',
  issueDate: '13 May 2026',
  image:
    'https://www.pngkit.com/png/detail/99-993245_atrc-certified-logo-certification.png',
  externalUrl: 'https://unlock-protocol.com',
  customMetadata: [
    {
      trait_type: 'Cohort',
      value: 'Spring 2026',
    },
    {
      trait_type: 'Level',
      value: 'Advanced',
    },
    {
      trait_type: 'Credential ID',
      value: 'CERT-2026-BASE-0001',
    },
  ],
}

export const CertificateBase = {
  args: {
    name: 'Example Certification',
    description:
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"',
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
    description:
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"',
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

export const CertificateWithRecipientDetails = {
  args: certificateWithRecipientDetailsArgs,
} satisfies Story

export const CertificateWithRecipientDetailsMobile = {
  args: {
    ...certificateWithRecipientDetailsArgs,
    isMobile: true,
  },
} satisfies Story
