import { Certificate } from './Certificate'
import { Meta, StoryObj } from '@storybook/react'

const meta = {
  component: Certificate,
  title: 'Certification',
} satisfies Meta<typeof Certificate>

export default meta
type Story = StoryObj<typeof meta>

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

export const CertificateWithAttestation = {
  args: {
    name: 'Blockchain Developer Certification',
    description:
      'This certification validates expertise in blockchain development, smart contract programming, and decentralized application design.',
    owner: '0xF3850C690BFF6c1E343D2449bBbbb00b0E934f7b',
    issuer: 'Unlock Protocol Academy',
    network: 8453,
    tokenId: 42,
    lockAddress: '0x62CcB13A72E6F991dE53b9B7AC42885151588Cd2',
    transactionsHash: '0x1234...5678',
    issueDate: '15 Jan 2025',
    image:
      'https://www.pngkit.com/png/detail/99-993245_atrc-certified-logo-certification.png',
    externalUrl: 'https://unlock-protocol.com',
    attestation: {
      attestationId:
        '0x3a9923db8a119d3bd312ca18781631c2f96fe5d31e67b437eb919148bfd84be6',
      firstName: 'John',
      lastName: 'Doe',
    },
  },
} satisfies Story

export const CertificateWithPartialAttestation = {
  args: {
    name: 'Web3 Fundamentals',
    description: 'Completed the Web3 Fundamentals course with distinction.',
    owner: '0xF3850C690BFF6c1E343D2449bBbbb00b0E934f7b',
    issuer: 'Unlock Labs',
    network: 84532,
    tokenId: 101,
    lockAddress: '0x62CcB13A72E6F991dE53b9B7AC42885151588Cd2',
    transactionsHash: '0xabcd...efgh',
    issueDate: '20 Jan 2025',
    image:
      'https://www.pngkit.com/png/detail/99-993245_atrc-certified-logo-certification.png',
    externalUrl: 'https://unlock-protocol.com',
    attestation: {
      firstName: 'Jane',
    },
  },
} satisfies Story
