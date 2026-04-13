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
    expect(() => parseArgument('bytes', 'abcd')).toThrow(/must start with 0x/)
  })

  it('throws on bytes with odd-length hex (e.g. 0xabc = 1.5 bytes)', () => {
    expect(() => parseArgument('bytes', '0xabc')).toThrow(/even number of hex/)
  })

  it('throws when uint8 value overflows', () => {
    expect(() => parseArgument('uint8', '256')).toThrow(/exceeds maximum/)
    expect(() => parseArgument('uint8', '255')).not.toThrow()
  })

  it('throws when int8 value is out of range', () => {
    expect(() => parseArgument('int8', '128')).toThrow(/out of range/)
    expect(() => parseArgument('int8', '-129')).toThrow(/out of range/)
    expect(() => parseArgument('int8', '127')).not.toThrow()
    expect(() => parseArgument('int8', '-128')).not.toThrow()
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

  it('throws on negative value for uint type', () => {
    expect(() => parseArgument('uint256', '-1')).toThrow(/Invalid integer/)
    expect(() => parseArgument('uint8', '-100')).toThrow(/Invalid integer/)
  })

  it('accepts negative value for signed int type', () => {
    expect(parseArgument('int256', '-1')).toBe(-1n)
  })

  it('throws when fixed array has wrong element count', () => {
    expect(() => parseArgument('uint256[3]', '[1,2]')).toThrow(
      /requires exactly 3 elements/
    )
    expect(() =>
      parseArgument(
        'address[2]',
        `["${validAddress}","${validAddress}","${validAddress}"]`
      )
    ).toThrow(/requires exactly 2 elements/)
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

  it('encodes a custom-contract call correctly', () => {
    const customCall = {
      id: 'custom-id',
      args: [validAddress, '500'],
      customAbi: JSON.stringify(erc20Abi),
      customAddress: validAddress,
      functionName: 'transfer(address,uint256)',
      kind: 'custom' as const,
      knownContract: '',
      value: '0',
    }
    const payload = buildSimpleProposalPayload('Title', 'Desc', [customCall])
    expect(payload.targets[0]).toBe(validAddress)
    expect(payload.calldatas[0]).toMatch(/^0x/)
  })

  it('throws on custom call with invalid ABI', () => {
    const customCall = {
      id: 'custom-id',
      args: [],
      customAbi: 'not json',
      customAddress: validAddress,
      functionName: 'transfer(address,uint256)',
      kind: 'custom' as const,
      knownContract: '',
      value: '0',
    }
    expect(() =>
      buildSimpleProposalPayload('Title', 'Desc', [customCall])
    ).toThrow(/Custom ABI is invalid/)
  })

  it('throws on custom call with non-address', () => {
    const customCall = {
      id: 'custom-id',
      args: [validAddress, '0'],
      customAbi: JSON.stringify(erc20Abi),
      customAddress: '0xinvalid',
      functionName: 'transfer(address,uint256)',
      kind: 'custom' as const,
      knownContract: '',
      value: '0',
    }
    expect(() =>
      buildSimpleProposalPayload('Title', 'Desc', [customCall])
    ).toThrow(/valid custom contract address/)
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

  it('throws when JSON is not an object (null, array, primitive)', () => {
    expect(() => buildAdvancedProposalPayload('null')).toThrow(
      /must be an object/
    )
    expect(() => buildAdvancedProposalPayload('[]')).toThrow(
      /must be an object/
    )
    expect(() => buildAdvancedProposalPayload('42')).toThrow(
      /must be an object/
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

  it('throws when a uint arg inside a tuple is a JS number', () => {
    const tupleAbi = [
      {
        name: 'deposit',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          {
            name: 'params',
            type: 'tuple',
            components: [
              { name: 'recipient', type: 'address' },
              { name: 'amount', type: 'uint256' },
            ],
          },
        ],
        outputs: [],
      },
    ]
    const json = JSON.stringify({
      proposalName: 'Title',
      calls: [
        {
          contractAbi: tupleAbi,
          contractAddress: validAddress,
          functionName: 'deposit',
          functionArgs: [
            { recipient: validAddress, amount: 1000000000000000000 },
          ],
        },
      ],
    })
    expect(() => buildAdvancedProposalPayload(json)).toThrow(/precision loss/)
  })

  it('throws when functionArgs has fewer elements than the ABI requires', () => {
    const json = JSON.stringify({
      proposalName: 'Title',
      calls: [
        {
          contractAbi: erc20Abi,
          contractAddress: validAddress,
          functionName: 'transfer',
          functionArgs: [validAddress], // missing amount
        },
      ],
    })
    expect(() => buildAdvancedProposalPayload(json)).toThrow(
      /requires 2 arguments/
    )
  })

  it('throws when call.value is negative in advanced mode', () => {
    const json = JSON.stringify({
      proposalName: 'Title',
      calls: [
        {
          contractAbi: erc20Abi,
          contractAddress: validAddress,
          functionName: 'transfer',
          functionArgs: [validAddress, '0'],
          value: '-1',
        },
      ],
    })
    expect(() => buildAdvancedProposalPayload(json)).toThrow(
      /cannot be negative/
    )
  })

  it('throws when call.value is 0 as a JS number (falsy precision bypass)', () => {
    const json = JSON.stringify({
      proposalName: 'Title',
      calls: [
        {
          contractAbi: erc20Abi,
          contractAddress: validAddress,
          functionName: 'transfer',
          functionArgs: [validAddress, '0'],
          value: 0, // numeric zero — falsy, would bypass old truthy guard
        },
      ],
    })
    expect(() => buildAdvancedProposalPayload(json)).toThrow(/precision loss/)
  })

  it('throws when call.value is a JS number (precision loss risk)', () => {
    const json = JSON.stringify({
      proposalName: 'Title',
      calls: [
        {
          contractAbi: erc20Abi,
          contractAddress: validAddress,
          functionName: 'transfer',
          functionArgs: [validAddress, '0'],
          value: 1000000000000000000, // unquoted — precision loss risk
        },
      ],
    })
    expect(() => buildAdvancedProposalPayload(json)).toThrow(/precision loss/)
  })

  it('throws when a uint arg is a JS number (precision loss risk)', () => {
    const json = JSON.stringify({
      proposalName: 'Title',
      calls: [
        {
          contractAbi: erc20Abi,
          contractAddress: validAddress,
          functionName: 'transfer',
          // amount is uint256 — passing as JS number, not quoted string
          functionArgs: [validAddress, 1000000000000000000],
        },
      ],
    })
    expect(() => buildAdvancedProposalPayload(json)).toThrow(/precision loss/)
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
