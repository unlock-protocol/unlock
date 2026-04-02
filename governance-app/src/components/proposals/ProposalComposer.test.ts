// ABOUTME: Unit tests for ProposalComposer pure functions — payload builders and argument parser.
// ABOUTME: These functions encode on-chain governance proposals; correctness is critical.
import { describe, expect, it } from 'vitest'

import {
  buildAdvancedProposalPayload,
  buildSimpleProposalPayload,
  parseArgument,
} from '~/lib/governance/composer'

// Minimal ABI used across tests
const erc20Abi = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
]

const validAddress = '0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187'

// ---------------------------------------------------------------------------
// parseArgument
// ---------------------------------------------------------------------------

describe('parseArgument', () => {
  it('parses a valid address', () => {
    expect(parseArgument('address', validAddress)).toBe(
      '0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187'
    )
  })

  it('throws on invalid address', () => {
    expect(() => parseArgument('address', '0xinvalid')).toThrow(
      /Invalid address/
    )
  })

  it('parses bool true', () => {
    expect(parseArgument('bool', 'true')).toBe(true)
  })

  it('parses bool false', () => {
    expect(parseArgument('bool', 'false')).toBe(false)
  })

  it('throws on invalid bool', () => {
    expect(() => parseArgument('bool', 'yes')).toThrow(/Invalid boolean/)
  })

  it('parses uint256', () => {
    expect(parseArgument('uint256', '1000000000000000000')).toBe(
      1000000000000000000n
    )
  })

  it('throws on invalid uint256', () => {
    expect(() => parseArgument('uint256', 'abc')).toThrow(/Invalid integer/)
  })

  it('parses bytes32', () => {
    const val = `0x${'ab'.repeat(32)}`
    expect(parseArgument('bytes32', val)).toBe(val)
  })

  it('throws on bytes32 wrong length', () => {
    expect(() => parseArgument('bytes32', '0xabcd')).toThrow(
      /requires exactly 32 bytes/
    )
  })

  it('throws on bytes without 0x prefix', () => {
    expect(() => parseArgument('bytes', 'abcd')).toThrow(/0x-prefixed/)
  })

  it('parses dynamic bytes', () => {
    expect(parseArgument('bytes', '0xdeadbeef')).toBe('0xdeadbeef')
  })

  it('parses string (including empty)', () => {
    expect(parseArgument('string', '')).toBe('')
    expect(parseArgument('string', 'hello')).toBe('hello')
  })

  it('parses address[]', () => {
    const result = parseArgument('address[]', `["${validAddress}"]`)
    expect(result).toEqual([validAddress])
  })

  it('parses uint256[3] fixed array', () => {
    const result = parseArgument('uint256[3]', '[1,2,3]')
    expect(result).toEqual([1n, 2n, 3n])
  })

  it('throws on non-array for array type', () => {
    expect(() => parseArgument('address[]', '"notanarray"')).toThrow(
      /Expected an array/
    )
  })

  it('parses tuple JSON passthrough', () => {
    const result = parseArgument('tuple', `["${validAddress}", 42]`)
    expect(result).toEqual([validAddress, 42])
  })

  it('throws on unsupported type', () => {
    expect(() => parseArgument('mapping(address=>uint256)', 'x')).toThrow(
      /Unsupported argument type/
    )
  })
})

// ---------------------------------------------------------------------------
// buildSimpleProposalPayload
// ---------------------------------------------------------------------------

describe('buildSimpleProposalPayload', () => {
  const baseCall = {
    id: 'test-id',
    args: [validAddress, '1000000000000000000'],
    customAbi: '[]',
    customAddress: '',
    functionName: 'transfer(address,uint256)',
    kind: 'known' as const,
    knownContract: 'UPToken',
    value: '0',
  }

  it('throws when title is empty', () => {
    expect(() =>
      buildSimpleProposalPayload('', 'description', [baseCall])
    ).toThrow(/proposal title/)
  })

  it('throws when description is empty', () => {
    expect(() => buildSimpleProposalPayload('Title', '', [baseCall])).toThrow(
      /proposal description/
    )
  })

  it('throws when calls array is empty', () => {
    expect(() => buildSimpleProposalPayload('Title', 'Desc', [])).toThrow(
      /At least one call/
    )
  })

  it('throws when function is not selected', () => {
    expect(() =>
      buildSimpleProposalPayload('Title', 'Desc', [
        { ...baseCall, functionName: '' },
      ])
    ).toThrow(/Select a function/)
  })

  it('includes title in description', () => {
    const payload = buildSimpleProposalPayload('My Title', 'My Desc', [
      baseCall,
    ])
    expect(payload.description).toContain('My Title')
    expect(payload.description).toContain('My Desc')
  })

  it('returns arrays of matching length', () => {
    const payload = buildSimpleProposalPayload('Title', 'Desc', [baseCall])
    expect(payload.targets).toHaveLength(1)
    expect(payload.values).toHaveLength(1)
    expect(payload.calldatas).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// buildAdvancedProposalPayload
// ---------------------------------------------------------------------------

describe('buildAdvancedProposalPayload', () => {
  const validJson = JSON.stringify({
    proposalName: 'Test proposal',
    description: 'Body text',
    calls: [
      {
        contractAbi: erc20Abi,
        contractAddress: validAddress,
        functionName: 'transfer',
        functionArgs: [validAddress, '1000000000000000000'],
      },
    ],
  })

  it('throws on invalid JSON', () => {
    expect(() => buildAdvancedProposalPayload('{bad json')).toThrow(
      /Proposal JSON is invalid/
    )
  })

  it('throws when proposalName is missing', () => {
    const json = JSON.stringify({
      calls: [
        {
          contractAbi: erc20Abi,
          contractAddress: validAddress,
          functionName: 'transfer',
          functionArgs: [],
        },
      ],
    })
    expect(() => buildAdvancedProposalPayload(json)).toThrow(/proposalName/)
  })

  it('throws when calls array is empty', () => {
    const json = JSON.stringify({ proposalName: 'Title', calls: [] })
    expect(() => buildAdvancedProposalPayload(json)).toThrow(
      /At least one advanced call/
    )
  })

  it('throws on invalid contract address', () => {
    const json = JSON.stringify({
      proposalName: 'Title',
      calls: [
        {
          contractAbi: erc20Abi,
          contractAddress: '0xinvalid',
          functionName: 'transfer',
          functionArgs: [],
        },
      ],
    })
    expect(() => buildAdvancedProposalPayload(json)).toThrow(
      /Invalid contract address/
    )
  })

  it('throws when functionArgs is not an array', () => {
    const json = JSON.stringify({
      proposalName: 'Title',
      calls: [
        {
          contractAbi: erc20Abi,
          contractAddress: validAddress,
          functionName: 'transfer',
          functionArgs: 'not-an-array',
        },
      ],
    })
    expect(() => buildAdvancedProposalPayload(json)).toThrow(/must be an array/)
  })

  it('builds a valid payload', () => {
    const payload = buildAdvancedProposalPayload(validJson)
    expect(payload.targets).toHaveLength(1)
    expect(payload.calldatas[0]).toMatch(/^0x/)
    expect(payload.description).toContain('Test proposal')
    expect(payload.description).toContain('Body text')
  })

  it('uses proposalName alone when description is omitted', () => {
    const json = JSON.stringify({
      proposalName: 'Title only',
      calls: [
        {
          contractAbi: erc20Abi,
          contractAddress: validAddress,
          functionName: 'transfer',
          functionArgs: [validAddress, '0'],
        },
      ],
    })
    const payload = buildAdvancedProposalPayload(json)
    expect(payload.description).toBe('Title only')
  })
})
