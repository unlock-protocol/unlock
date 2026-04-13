// ABOUTME: Pure functions for encoding governance proposals — payload builders, argument parser.
// ABOUTME: No React or browser dependencies; safe to import in tests and server components.
import {
  FunctionFragment,
  getAddress,
  Interface,
  type InterfaceAbi,
  isAddress,
  type ParamType,
} from 'ethers'
import { governanceConfig } from '~/config/governance'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CallDraft = {
  id: string
  args: string[]
  customAbi: string
  customAddress: string
  functionName: string
  kind: 'known' | 'custom'
  knownContract: string
  value: string
}

type AdvancedProposal = {
  proposalName: string
  description?: string
  calls: Array<{
    contractAbi: unknown[]
    contractAddress: string
    functionArgs: unknown[]
    functionName: string
    value?: string
  }>
}

type PreparedCall = {
  calldata: string
  target: string
  value: bigint
}

export type ProposalPayload = {
  calldatas: string[]
  description: string
  targets: string[]
  values: bigint[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const knownContractAddresses: Record<string, string> = Object.fromEntries(
  governanceConfig.knownContracts
    .filter(({ address }) => address)
    .map(({ label, address }) => [label, address])
)

export function resolveKnownContractAddress(contractLabel: string) {
  return knownContractAddresses[contractLabel] || ''
}

function resolveContractAbi(abi: unknown): InterfaceAbi {
  if (abi && typeof abi === 'object' && 'abi' in abi) {
    return (abi as { abi: InterfaceAbi }).abi
  }
  return abi as InterfaceAbi
}

function parseAdvancedProposal(advancedJson: string) {
  let parsed: unknown
  try {
    parsed = JSON.parse(advancedJson)
  } catch {
    throw new Error('Proposal JSON is invalid.')
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Proposal JSON must be an object.')
  }
  return parsed as AdvancedProposal
}

export function parseCustomAbi(
  value: string
): { abi: unknown[] } | { error: string } {
  if (!value.trim()) return { abi: [] }
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) {
      return { error: 'ABI must be a JSON array.' }
    }
    return { abi: parsed }
  } catch {
    return { error: 'ABI is not valid JSON.' }
  }
}

export function getFunctionChoices(abi: unknown): FunctionFragment[] {
  if (!abi) return []
  try {
    return new Interface(resolveContractAbi(abi)).fragments.filter(
      (fragment) =>
        fragment.type === 'function' &&
        ((fragment as FunctionFragment).stateMutability === 'nonpayable' ||
          (fragment as FunctionFragment).stateMutability === 'payable')
    ) as FunctionFragment[]
  } catch {
    return []
  }
}

// Throws if a raw JS number is used for an integer ABI type — JSON numbers
// above Number.MAX_SAFE_INTEGER silently lose precision before ethers sees them.
// Uses ParamType so it can recurse correctly into arrays and tuple components.
function assertNoNumberInIntPosition(
  arg: unknown,
  param: ParamType,
  path: string
): void {
  // Array types — recurse using arrayChildren for element type info
  if (param.isArray()) {
    if (Array.isArray(arg) && param.arrayChildren) {
      ;(arg as unknown[]).forEach((item, i) =>
        assertNoNumberInIntPosition(item, param.arrayChildren!, `${path}[${i}]`)
      )
    }
    return
  }

  // Tuple types — recurse into each component
  if (param.isTuple() && param.components) {
    if (Array.isArray(arg)) {
      // Positional encoding: [value0, value1, ...]
      param.components.forEach((component, i) =>
        assertNoNumberInIntPosition(
          (arg as unknown[])[i],
          component,
          `${path}[${i}]`
        )
      )
    } else if (arg && typeof arg === 'object') {
      // Named encoding: { field0: value0, field1: value1, ... }
      param.components.forEach((component, ci) => {
        // Use component name when available; fall back to index for unnamed components.
        const key = component.name || String(ci)
        assertNoNumberInIntPosition(
          (arg as Record<string, unknown>)[key],
          component,
          `${path}.${key}`
        )
      })
    }
    return
  }

  // Integer types
  if (
    (param.type.startsWith('uint') || param.type.startsWith('int')) &&
    typeof arg === 'number'
  ) {
    throw new Error(
      `Argument "${path}" (${param.type}) must be a quoted string to avoid precision loss — use "${arg}" instead of ${arg}.`
    )
  }
}

// ---------------------------------------------------------------------------
// Argument parser
// ---------------------------------------------------------------------------

export function parseArgument(type: string, value: string): unknown {
  // Match both dynamic arrays (T[]) and fixed-size arrays (T[N])
  const arrayMatch = type.match(/^(.+)\[(\d*)\]$/)
  if (arrayMatch) {
    let parsed: unknown
    try {
      parsed = JSON.parse(value)
    } catch {
      throw new Error(
        `Expected a JSON array for ${type}. Example: ["0x1234", "0x5678"]`
      )
    }
    const childType = arrayMatch[1]
    const fixedLength = arrayMatch[2] ? parseInt(arrayMatch[2], 10) : null

    if (!Array.isArray(parsed)) {
      throw new Error(`Expected an array for ${type}.`)
    }

    if (fixedLength !== null && parsed.length !== fixedLength) {
      throw new Error(
        `${type} requires exactly ${fixedLength} element${fixedLength === 1 ? '' : 's'}, got ${parsed.length}.`
      )
    }

    return parsed.map((item) =>
      parseArgument(
        childType,
        typeof item === 'string' ? item : JSON.stringify(item)
      )
    )
  }

  if (type === 'address') {
    if (!isAddress(value)) {
      throw new Error(`Invalid address: ${value}`)
    }

    return getAddress(value)
  }

  if (type === 'bool') {
    if (value !== 'true' && value !== 'false') {
      throw new Error(`Invalid boolean value: ${value}`)
    }

    return value === 'true'
  }

  if (type.startsWith('uint')) {
    let v: bigint
    try {
      v = BigInt(value)
    } catch {
      throw new Error(`Invalid integer value for ${type}: "${value}"`)
    }
    if (v < 0n) {
      throw new Error(`Invalid integer value for ${type}: "${value}"`)
    }
    const uBitMatch = type.match(/^uint(\d+)$/)
    if (uBitMatch) {
      const bits = parseInt(uBitMatch[1], 10)
      const max = 2n ** BigInt(bits) - 1n
      if (v > max) {
        throw new Error(`${type} value ${v} exceeds maximum ${max}.`)
      }
    }
    return v
  }

  if (type.startsWith('int')) {
    let v: bigint
    try {
      v = BigInt(value)
    } catch {
      throw new Error(`Invalid integer value for ${type}: "${value}"`)
    }
    const iBitMatch = type.match(/^int(\d+)$/)
    if (iBitMatch) {
      const bits = parseInt(iBitMatch[1], 10)
      const min = -(2n ** BigInt(bits - 1))
      const max = 2n ** BigInt(bits - 1) - 1n
      if (v < min || v > max) {
        throw new Error(`${type} value ${v} is out of range [${min}, ${max}].`)
      }
    }
    return v
  }

  if (type.startsWith('bytes')) {
    if (!value.startsWith('0x')) {
      throw new Error(`${type} must start with 0x (e.g. 0xabcd).`)
    }
    // Each byte = 2 hex chars; odd-length strings like 0xabc are invalid.
    if (!/^0x([0-9a-fA-F]{2})*$/.test(value)) {
      throw new Error(
        `${type} must have an even number of hex chars after 0x (e.g. 0xabcd, not 0xabc).`
      )
    }
    // For fixed-size bytesN, validate exact byte length.
    const fixedSizeMatch = type.match(/^bytes(\d+)$/)
    if (fixedSizeMatch) {
      const expectedBytes = parseInt(fixedSizeMatch[1], 10)
      const hexChars = value.length - 2 // strip 0x
      if (hexChars !== expectedBytes * 2) {
        throw new Error(
          `${type} requires exactly ${expectedBytes} bytes (${expectedBytes * 2} hex chars), got ${hexChars / 2}.`
        )
      }
    }
    return value
  }

  if (type === 'string') {
    return value
  }

  if (type === 'tuple' || type.startsWith('tuple(') || type.startsWith('(')) {
    // Tuple args (both ethers-normalised 'tuple(...)' and raw '(...)' forms).
    // Pass the parsed JSON through for ethers to encode.
    try {
      return JSON.parse(value)
    } catch {
      throw new Error(`Tuple argument must be valid JSON (e.g. ["0x...", 1]).`)
    }
  }

  throw new Error(`Unsupported argument type in simple mode: ${type}`)
}

// ---------------------------------------------------------------------------
// Payload builders
// ---------------------------------------------------------------------------

export function buildSimpleProposalPayload(
  title: string,
  description: string,
  calls: CallDraft[]
): ProposalPayload {
  if (!title.trim()) {
    throw new Error('Enter a proposal title.')
  }

  if (!description.trim()) {
    throw new Error('Enter a proposal description.')
  }

  if (calls.length === 0) {
    throw new Error('At least one call is required.')
  }

  const preparedCalls = calls.map((call) => prepareSimpleCall(call))

  return {
    calldatas: preparedCalls.map(({ calldata }) => calldata),
    description: `${title.trim()}\n\n${description.trim()}`,
    targets: preparedCalls.map(({ target }) => target),
    values: preparedCalls.map(({ value }) => value),
  }
}

export function buildAdvancedProposalPayload(
  advancedJson: string
): ProposalPayload {
  const parsed = parseAdvancedProposal(advancedJson)
  const title = parsed.proposalName?.trim()

  if (!title) {
    throw new Error('proposalName is required.')
  }

  if (!Array.isArray(parsed.calls) || parsed.calls.length === 0) {
    throw new Error('At least one advanced call is required.')
  }

  const preparedCalls = parsed.calls.map((call) => {
    if (!Array.isArray(call.contractAbi)) {
      throw new Error('contractAbi must be an inline ABI array.')
    }

    if (typeof call.contractAddress !== 'string' || !call.contractAddress) {
      throw new Error('contractAddress is required and must be a string.')
    }

    if (!isAddress(call.contractAddress)) {
      throw new Error(`Invalid contract address: ${call.contractAddress}`)
    }

    if (typeof call.functionName !== 'string' || !call.functionName) {
      throw new Error('functionName is required and must be a string.')
    }

    const contractInterface = new Interface(call.contractAbi as InterfaceAbi)
    const fragment = contractInterface.getFunction(call.functionName)

    if (!fragment) {
      throw new Error(`Function not found in ABI: ${call.functionName}`)
    }

    let ethValue = 0n
    // Check string type before truthy guard — numeric 0 is falsy and would
    // otherwise skip the precision check entirely.
    if (call.value !== undefined && typeof call.value !== 'string') {
      throw new Error(
        `"value" for call to ${call.functionName} must be a quoted string to avoid precision loss — use "${call.value}" instead of ${call.value}.`
      )
    }
    if (call.value && call.value !== '0') {
      try {
        ethValue = BigInt(call.value)
      } catch {
        throw new Error(
          `Invalid value "${call.value}" for call to ${call.functionName}. Use a whole number in wei.`
        )
      }
      if (ethValue < 0n) {
        throw new Error(
          `ETH value for call to ${call.functionName} cannot be negative.`
        )
      }
    }

    if (call.functionArgs !== undefined && !Array.isArray(call.functionArgs)) {
      throw new Error(
        `functionArgs for "${call.functionName}" must be an array.`
      )
    }

    const args = call.functionArgs ?? []
    if (args.length < fragment.inputs.length) {
      throw new Error(
        `functionArgs for "${call.functionName}" requires ${fragment.inputs.length} argument${fragment.inputs.length === 1 ? '' : 's'}, got ${args.length}.`
      )
    }
    if (args.length > fragment.inputs.length) {
      throw new Error(
        `functionArgs for "${call.functionName}" expects ${fragment.inputs.length} argument${fragment.inputs.length === 1 ? '' : 's'} but got ${args.length} — extra arguments are silently dropped by ethers.`
      )
    }
    fragment.inputs.forEach((input, i) =>
      assertNoNumberInIntPosition(args[i], input, input.name || `arg${i}`)
    )

    return {
      calldata: contractInterface.encodeFunctionData(fragment, args),
      target: getAddress(call.contractAddress),
      value: ethValue,
    }
  })

  const body = parsed.description?.trim()

  return {
    calldatas: preparedCalls.map(({ calldata }) => calldata),
    description: body ? `${title}\n\n${body}` : title,
    targets: preparedCalls.map(({ target }) => target),
    values: preparedCalls.map(({ value }) => value),
  }
}

function prepareSimpleCall(call: CallDraft): PreparedCall {
  let abi: unknown
  if (call.kind === 'custom') {
    const result = parseCustomAbi(call.customAbi)
    if ('error' in result) {
      throw new Error(`Custom ABI is invalid: ${result.error}`)
    }
    abi = result.abi
  } else {
    abi = governanceConfig.knownContracts.find(
      ({ label }) => label === call.knownContract
    )?.abi
  }

  if (!abi) {
    throw new Error(`Missing ABI for ${call.knownContract}.`)
  }

  if (!call.functionName) {
    const label =
      call.kind === 'custom' ? call.customAddress : call.knownContract
    throw new Error(`Select a function for the call to ${label}.`)
  }

  const contractInterface = new Interface(resolveContractAbi(abi))
  const fragment = contractInterface.getFunction(call.functionName)

  if (!fragment) {
    throw new Error(`Function not found in ABI: ${call.functionName}`)
  }
  const parsedArgs = fragment.inputs.map((input, index) =>
    parseArgument(input.type, call.args[index] || '')
  )
  // Tuple inputs pass through JSON.parse in parseArgument, which can produce
  // JS numbers for large integers — run the same precision guard as advanced mode.
  fragment.inputs.forEach((input, index) =>
    assertNoNumberInIntPosition(
      parsedArgs[index],
      input,
      input.name || `arg${index}`
    )
  )
  const target =
    call.kind === 'custom'
      ? call.customAddress
      : resolveKnownContractAddress(call.knownContract)

  if (!isAddress(target)) {
    throw new Error(
      call.kind === 'custom'
        ? 'Enter a valid custom contract address (0x...).'
        : `Missing target address for ${call.knownContract}.`
    )
  }

  let ethValue = 0n
  if (call.value && call.value !== '0') {
    try {
      ethValue = BigInt(call.value)
    } catch {
      throw new Error(
        `Invalid ETH value "${call.value}". Enter a whole number in wei.`
      )
    }
    if (ethValue < 0n) {
      throw new Error('ETH value cannot be negative.')
    }
  }

  return {
    calldata: contractInterface.encodeFunctionData(fragment, parsedArgs),
    target: getAddress(target),
    value: ethValue,
  }
}
