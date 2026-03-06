import { vi, expect, describe, it, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Key from '~/components/interface/keychain/Key'

// ResizeObserver polyfill for JSDOM (used by @headlessui)
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any

const OWNER = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const LOCK_ADDRESS = '0x5EbE148252FFab5b35Aa6a19AE373d1fd066cffA'

// Hoisted mocks
const {
  mockUseGetAttestationsForKey,
  mockUseGetReceiptsForKey,
  mockDownloadAttestationPdf,
} = vi.hoisted(() => ({
  mockUseGetAttestationsForKey: vi.fn(),
  mockUseGetReceiptsForKey: vi.fn(),
  mockDownloadAttestationPdf: vi.fn(),
}))

vi.mock('~/hooks/useAuthenticate', () => ({
  useAuthenticate: () => ({ account: OWNER }),
}))

vi.mock('~/hooks/useProvider', () => ({
  useProvider: () => ({
    getWalletService: vi.fn(),
    watchAsset: vi.fn(),
  }),
}))

vi.mock('~/utils/withWeb3Service', () => ({
  useWeb3Service: () => ({
    getLock: vi.fn().mockResolvedValue({}),
    providerForNetwork: vi.fn().mockReturnValue({}),
    tokenURI: vi.fn().mockResolvedValue(''),
  }),
}))

vi.mock('~/utils/withConfig', () => ({
  useConfig: () => ({
    networks: {
      31337: { nativeCurrency: { symbol: 'ETH' } },
    },
  }),
}))

vi.mock('~/hooks/useReceipts', () => ({
  useGetReceiptsForKey: mockUseGetReceiptsForKey,
  receiptsUrl: vi.fn().mockReturnValue('/receipts'),
}))

vi.mock('~/hooks/useKeyAttestations', () => ({
  useGetAttestationsForKey: mockUseGetAttestationsForKey,
  downloadAttestationPdf: mockDownloadAttestationPdf,
}))

vi.mock('~/hooks/useTransferFee', () => ({
  useFetchTransferFee: () => ({
    isLoading: false,
    error: null,
    data: 0,
  }),
}))

vi.mock('~/hooks/useMetadata', () => ({
  default: () => ({ image: '' }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

const mockOwnedKey = {
  lock: {
    address: LOCK_ADDRESS,
    name: 'Test Lock',
  },
  expiration: '9999999999',
  tokenId: '1',
  isExpired: false,
  isExtendable: true,
  isRenewable: false,
  network: 31337,
}

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUseGetReceiptsForKey.mockReturnValue({ data: [] })
})

afterEach(() => {
  cleanup()
})

describe('Key component', () => {
  it('should display the Download attestation button when attestations exist', async () => {
    const user = userEvent.setup()

    mockUseGetAttestationsForKey.mockReturnValue({
      data: [
        {
          id: '1',
          lockAddress: LOCK_ADDRESS,
          network: 31337,
          tokenId: OWNER,
          schemaId: '0xabc',
          attestationId: '0xdef',
          data: { firstName: 'John', lastName: 'Doe' },
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
    })

    renderWithProviders(
      <Key ownedKey={mockOwnedKey as any} owner={OWNER} network={31337} />
    )

    // Open the Actions menu
    await user.click(screen.getByText('Actions'))

    // The "Download attestation" button should be visible
    await waitFor(() => {
      expect(screen.getByText('Download attestation')).not.toBe(null)
    })
  })

  it('should NOT display the Download attestation button when there are no attestations', async () => {
    const user = userEvent.setup()

    mockUseGetAttestationsForKey.mockReturnValue({
      data: [],
    })

    renderWithProviders(
      <Key ownedKey={mockOwnedKey as any} owner={OWNER} network={31337} />
    )

    // Open the Actions menu
    await user.click(screen.getByText('Actions'))

    // The "Download attestation" button should NOT be in the document
    expect(screen.queryByText('Download attestation')).toBe(null)
  })
})
