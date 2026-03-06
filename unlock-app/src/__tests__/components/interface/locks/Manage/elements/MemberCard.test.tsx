import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  MemberCard,
  MemberCardProps,
} from '../../../../../../components/interface/locks/Manage/elements/MemberCard'

// Mock child components
vi.mock('~/components/creator/members/CreateAttestationDrawer', () => ({
  default: ({
    isOpen,
    setIsOpen,
  }: {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
  }) =>
    isOpen ? (
      <div data-testid="attestation-drawer">
        <button
          onClick={() => setIsOpen(false)}
          data-testid="close-attestation-drawer"
        >
          Close
        </button>
        Attestation Drawer Content
      </div>
    ) : null,
}))

vi.mock('~/components/creator/members/ExtendKeysDrawer', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? (
      <div data-testid="extend-keys-drawer">Extend Keys Drawer</div>
    ) : null,
}))

vi.mock('~/components/interface/ExpireAndRefundModal', () => ({
  ExpireAndRefundModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? (
      <div data-testid="expire-refund-modal">Expire Refund Modal</div>
    ) : null,
}))

vi.mock('~/components/interface/locks/Manage/elements/MetadataCard', () => ({
  MetadataCard: () => <div data-testid="metadata-card">Metadata Card</div>,
}))

vi.mock('~/components/interface/WrappedAddress', () => ({
  WrappedAddress: ({ address }: { address: string }) => (
    <span data-testid="wrapped-address">{address}</span>
  ),
}))

vi.mock('@unlock-protocol/ui', () => ({
  Button: ({ children, onClick, variant, size, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
  Collapse: ({ children, content, isOpen, setIsOpen, disabled }: any) => (
    <div data-testid="collapse" data-disabled={disabled}>
      <button onClick={() => setIsOpen(!isOpen)} data-testid="collapse-toggle">
        Toggle
      </button>
      {children}
      {isOpen && <div data-testid="collapse-content">{content}</div>}
    </div>
  ),
  Detail: ({ children, label }: any) => (
    <div data-testid={`detail-${label}`}>
      <span>{label}</span>
      <span>{children}</span>
    </div>
  ),
}))

vi.mock('~/utils/durations', () => ({
  expirationAsDate: (expiration: string) => {
    if (expiration === '0') return 'Expired'
    if (expiration === 'MAX_UINT') return 'Never'
    return '2025-12-31'
  },
}))

vi.mock('~/constants', () => ({
  MAX_UINT: 'MAX_UINT',
}))

describe('MemberCard', () => {
  const defaultProps: MemberCardProps = {
    token: '1',
    owner: '0x1234567890abcdef1234567890abcdef12345678',
    expiration: '1735689600', // Future timestamp
    version: 12,
    metadata: {
      token: '1',
      lockName: 'Test Lock',
    },
    lockAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    network: 84532, // Base Sepolia - needed for isBaseNetwork check
    expirationDuration: '2592000',
    isManager: true,
  }

  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the member card with basic information', () => {
      expect.assertions(2)

      render(<MemberCard {...defaultProps} />)

      expect(screen.getByTestId('collapse')).not.toBe(null)
      // WrappedAddress is inside the collapse content, need to open it
      fireEvent.click(screen.getByTestId('collapse-toggle'))
      expect(screen.getByTestId('wrapped-address')).not.toBe(null)
    })

    it('renders the owner address', () => {
      expect.assertions(1)

      render(<MemberCard {...defaultProps} />)

      // Owner address is inside the collapse content
      fireEvent.click(screen.getByTestId('collapse-toggle'))

      expect(
        screen.getByText('0x1234567890abcdef1234567890abcdef12345678')
      ).not.toBe(null)
    })
  })

  describe('Attestation functionality', () => {
    it('renders the "Create Attestation" button when user is manager', () => {
      expect.assertions(1)

      render(<MemberCard {...defaultProps} isManager={true} />)

      // Open the collapse to see the content
      fireEvent.click(screen.getByTestId('collapse-toggle'))

      expect(screen.getByText('Create Attestation')).not.toBe(null)
    })

    it('does not render the "Create Attestation" button when user is not manager', () => {
      expect.assertions(1)

      render(<MemberCard {...defaultProps} isManager={false} />)

      // Collapse is disabled when not manager, but we can check the button isn't rendered
      // even if content were visible
      expect(screen.queryByText('Create Attestation')).toBe(null)
    })

    it('does not render the "Create Attestation" button on non-base networks', () => {
      expect.assertions(1)

      render(<MemberCard {...defaultProps} isManager={true} network={1} />)

      fireEvent.click(screen.getByTestId('collapse-toggle'))

      expect(screen.queryByText('Create Attestation')).toBe(null)
    })

    it('opens CreateAttestationDrawer when "Create Attestation" button is clicked', () => {
      expect.assertions(2)

      render(<MemberCard {...defaultProps} isManager={true} />)

      // Open the collapse first
      fireEvent.click(screen.getByTestId('collapse-toggle'))

      // Initially drawer should not be visible
      expect(screen.queryByTestId('attestation-drawer')).toBe(null)

      // Click the Create Attestation button
      fireEvent.click(screen.getByText('Create Attestation'))

      // Now the drawer should be visible
      expect(screen.getByTestId('attestation-drawer')).not.toBe(null)
    })

    it('closes the attestation drawer when setIsOpen(false) is called', () => {
      expect.assertions(2)

      render(<MemberCard {...defaultProps} isManager={true} />)

      // Open collapse and click Create Attestation
      fireEvent.click(screen.getByTestId('collapse-toggle'))
      fireEvent.click(screen.getByText('Create Attestation'))

      // Drawer should be open
      expect(screen.getByTestId('attestation-drawer')).not.toBe(null)

      // Close the drawer
      fireEvent.click(screen.getByTestId('close-attestation-drawer'))

      // Drawer should be closed
      expect(screen.queryByTestId('attestation-drawer')).toBe(null)
    })
  })

  describe('Other manager actions', () => {
    it('renders the Extend button when canExtendKey is true', () => {
      expect.assertions(1)

      render(
        <MemberCard
          {...defaultProps}
          isManager={true}
          version={11}
          expiration="1735689600" // Not MAX_UINT
        />
      )

      fireEvent.click(screen.getByTestId('collapse-toggle'))

      expect(screen.getByText('Extend')).not.toBe(null)
    })

    it('opens ExtendKeysDrawer when Extend button is clicked', () => {
      expect.assertions(2)

      render(
        <MemberCard
          {...defaultProps}
          isManager={true}
          version={11}
          expiration="1735689600"
        />
      )

      fireEvent.click(screen.getByTestId('collapse-toggle'))

      expect(screen.queryByTestId('extend-keys-drawer')).toBe(null)

      fireEvent.click(screen.getByText('Extend'))

      expect(screen.getByTestId('extend-keys-drawer')).not.toBe(null)
    })

    it('renders Cancel button when refund is not disabled', () => {
      expect.assertions(1)

      render(
        <MemberCard
          {...defaultProps}
          isManager={true}
          expiration="9999999999" // Future expiration - key is valid
        />
      )

      fireEvent.click(screen.getByTestId('collapse-toggle'))

      expect(screen.getByText('Cancel')).not.toBe(null)
    })
  })

  describe('Collapse behavior', () => {
    it('is disabled when user is not a manager', () => {
      expect.assertions(1)

      render(<MemberCard {...defaultProps} isManager={false} />)

      expect(screen.getByTestId('collapse').getAttribute('data-disabled')).toBe(
        'true'
      )
    })

    it('is enabled when user is a manager', () => {
      expect.assertions(1)

      render(<MemberCard {...defaultProps} isManager={true} />)

      expect(screen.getByTestId('collapse').getAttribute('data-disabled')).toBe(
        'false'
      )
    })

    it('shows collapse content when toggled open', () => {
      expect.assertions(2)

      render(<MemberCard {...defaultProps} isManager={true} />)

      expect(screen.queryByTestId('collapse-content')).toBe(null)

      fireEvent.click(screen.getByTestId('collapse-toggle'))

      expect(screen.getByTestId('collapse-content')).not.toBe(null)
    })
  })
})
