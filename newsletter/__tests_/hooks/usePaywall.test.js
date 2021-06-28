import { renderHook, act } from '@testing-library/react-hooks'
import usePaywall from '../../hooks/usePaywall'

describe('usePaywall', () => {
  it('should set the configuration, load the script and set the event handler', async () => {
    expect.assertions(5)

    const { result } = renderHook(() => usePaywall(['0xabc']))
    expect(result.current[0]).toBe('loading')
    expect(result.current[1]).toBe(undefined)

    expect(window.unlockProtocolConfig).toEqual({
      callToAction: {
        confirmed:
          'You already have a key and you will soon receive new emails!',
        default:
          'Purchase access to the newsletter with crypto! You will need to send two transactions, one to approve the ERC20 transfer, and one for the actual purchase.',
        pending:
          'Your transaction has been sent. As soon as it has been mined, you will receive your Non Fungible Token!',
      },
      icon: 'https://app.unlock-protocol.com/static/images/svg/default.svg',
      locks: {
        '0xabc': {
          network: 1,
        },
      },
      network: 1,
      metadataInputs: [
        {
          name: 'Email Address',
          type: 'email',
          required: true,
        },
      ],
    })
    act(() => {
      window.dispatchEvent(
        new CustomEvent('unlockProtocol', { detail: 'unlocked' })
      )

      window.unlockProtocol = {
        blockchainData: () => {
          return {
            keys: {
              '0x123': {},
            },
          }
        },
      }
    })

    expect(result.current[0]).toBe('unlocked')
    expect(result.current[1]).toBe(undefined)
  })

  it('should not set the paywall if no lock address is passed', async () => {
    expect.assertions(3)

    const { result } = renderHook(() => usePaywall([]))
    expect(result.current[0]).toBe('loading')
    expect(result.current[1]).toBe(undefined)

    expect(window.unlockProtocolConfig).toEqual(undefined)
  })
})
