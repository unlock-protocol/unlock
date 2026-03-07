import { vi, expect, describe, it, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CreateAttestationDrawer from '~/components/creator/members/CreateAttestationDrawer'
import DynamicFormForAttestations from '~/components/creator/members/DynamicForAttestations'

// Hoisted mocks (must be declared before vi.mock calls)
const { mockCreateOffchainAttestation, mockToastSuccess, mockToastError } =
  vi.hoisted(() => ({
    mockCreateOffchainAttestation: vi.fn(),
    mockToastSuccess: vi.fn(),
    mockToastError: vi.fn(),
  }))

// Mocking the attestation hook
vi.mock('~/hooks/useAttestation', () => ({
  createOffchainAttestation: mockCreateOffchainAttestation,
}))

// Mock toaster helper
vi.mock('@unlock-protocol/ui', async () => {
  const actual = await vi.importActual('@unlock-protocol/ui')
  return {
    ...actual,
    ToastHelper: {
      success: mockToastSuccess,
      error: mockToastError,
    },
  }
})

const schema =
  'string firstName,string lastName,uint256 dateOfBirth,string grade,string thesis'

const mockSetIsOpen = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
})

describe('CreateAttestationDrawer', () => {
  describe('form display', () => {
    it('should display the form when open', () => {
      render(
        <CreateAttestationDrawer
          isOpen={true}
          setIsOpen={mockSetIsOpen}
          lockAddress="0x1234567890AbcdEF1234567890aBcdef12345678"
          network={84532}
          owner="0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa"
        />
      )
      expect(screen.getByText('Create Attestation')).not.toBe(null)
      expect(screen.getByRole('button', { name: /create & send/i })).not.toBe(
        null
      )
    })

    it('should render the proper fields in the schema', () => {
      const mockRegister = vi.fn().mockReturnValue({
        name: '',
        onChange: vi.fn(),
        onBlur: vi.fn(),
        ref: vi.fn(),
      })

      render(
        <DynamicFormForAttestations
          schema={schema}
          register={mockRegister}
          errors={{}}
        />
      )
      expect(screen.getByText('First Name')).not.toBe(null)
      expect(screen.getByText('Last Name')).not.toBe(null)
      expect(screen.getByText('Date of birth')).not.toBe(null)
      expect(screen.getByText('Grade')).not.toBe(null)
      expect(screen.getByText('Thesis')).not.toBe(null)
    })

    it('should check that all fields but email are mandatory', async () => {
      const user = userEvent.setup()
      render(
        <CreateAttestationDrawer
          isOpen={true}
          setIsOpen={mockSetIsOpen}
          lockAddress="0x1234567890AbcdEF1234567890aBcdef12345678"
          network={84532}
          owner="0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa"
        />
      )

      await user.click(screen.getByRole('button', { name: /create & send/i }))
      expect(await screen.findByText(/First Name is required/i)).not.toBe(null)
      expect(await screen.findByText(/Last Name is required/i)).not.toBe(null)
    }),
      it('should close the drawer when the attestation is successfully created', async () => {
        const user = userEvent.setup()

        // Mock successful attestation creation
        const mockAttestation = { uid: '0x123', signature: '0x567' }
        mockCreateOffchainAttestation.mockResolvedValue(mockAttestation)

        render(
          <CreateAttestationDrawer
            isOpen={true}
            setIsOpen={mockSetIsOpen}
            lockAddress="0x1234567890AbcdEF1234567890aBcdef12345678"
            network={84532}
          />
        )
        // Fill in required fields (default "Basic" schema has only firstName and lastName)
        await user.type(
          screen.getByPlaceholderText(/enter first name/i),
          'John'
        )
        await user.type(screen.getByPlaceholderText(/enter last name/i), 'Doe')

        // Submit the form
        await user.click(screen.getByRole('button', { name: /create & send/i }))
        await waitFor(() => {
          expect(mockSetIsOpen).toHaveBeenCalledWith(false)
        })
        expect(mockCreateOffchainAttestation).toHaveBeenCalledOnce()
      })
  })

  describe('toast notifications', () => {
    it('should show success toast when attestation is created successfully', async () => {
      const user = userEvent.setup()

      // Mock successful attestation creation
      const mockAttestation = { uid: '0x123', signature: '0xabc' }
      mockCreateOffchainAttestation.mockResolvedValue(mockAttestation)

      render(
        <CreateAttestationDrawer
          isOpen={true}
          setIsOpen={mockSetIsOpen}
          lockAddress="0x1234567890AbcdEF1234567890aBcdef12345678"
          network={84532}
          owner="0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa"
        />
      )

      // Fill in required fields (default "Basic" schema has only firstName and lastName)
      await user.type(screen.getByPlaceholderText(/enter first name/i), 'John')
      await user.type(screen.getByPlaceholderText(/enter last name/i), 'Doe')

      // Submit the form
      await user.click(screen.getByRole('button', { name: /create & send/i }))

      // Wait for the success toast to be called
      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(
          'Attestation created successfully'
        )
      })

      expect(mockCreateOffchainAttestation).toHaveBeenCalledTimes(1)
    })

    it('should show error toast and keep drawer open when attestation creation fails', async () => {
      const user = userEvent.setup()

      // Mock failed attestation creation
      const mockError = new Error('EAS config not found')
      mockCreateOffchainAttestation.mockRejectedValue(mockError)

      render(
        <CreateAttestationDrawer
          isOpen={true}
          setIsOpen={mockSetIsOpen}
          lockAddress="0x1234567890AbcdEF1234567890aBcdef12345678"
          network={84532}
          owner="0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa"
        />
      )

      // Fill in required fields (default "Basic" schema has only firstName and lastName)
      await user.type(screen.getByPlaceholderText(/enter first name/i), 'John')
      await user.type(
        screen.getByPlaceholderText(/enter last name/i),
        'Travolta'
      )

      // Submit the form
      await user.click(screen.getByRole('button', { name: /create & send/i }))

      // Wait for the error toast to be called
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          'Error creating attestation'
        )
      })

      // Verify the drawer stays open (setIsOpen should NOT be called with false)
      expect(mockSetIsOpen).not.toHaveBeenCalledWith(false)
      expect(mockCreateOffchainAttestation).toHaveBeenCalledOnce()
    })
  })
})
