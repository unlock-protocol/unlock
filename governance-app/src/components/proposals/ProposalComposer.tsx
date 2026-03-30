'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Input, TextBox, ToastHelper } from '@unlock-protocol/ui'
import {
  Contract,
  FunctionFragment,
  getAddress,
  Interface,
  type InterfaceAbi,
  isAddress,
  JsonRpcProvider,
} from 'ethers'
import { governanceEnv } from '~/config/env'
import { governanceConfig, txExplorerUrl } from '~/config/governance'
import { useGovernanceWallet } from '~/hooks/useGovernanceWallet'
import { formatTokenAmount } from '~/lib/governance/format'
import { getContractAbi, governorAbi, tokenAbi } from '~/lib/governance/rpc'

type ProposalComposerMode = 'simple' | 'advanced'

type CallDraft = {
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

type ProposalPayload = {
  calldatas: string[]
  description: string
  targets: string[]
  values: bigint[]
}

const customContractOption = 'Custom contract'

const defaultAdvancedJson = JSON.stringify(
  {
    proposalName: 'Upgrade Unlock governance parameters',
    description: 'Describe the rationale and expected outcome here.',
    calls: [
      {
        contractAbi: [],
        contractAddress: governanceConfig.timelockAddress,
        functionName: '',
        functionArgs: [],
      },
    ],
  },
  null,
  2
)

export function ProposalComposer({ tokenSymbol }: { tokenSymbol: string }) {
  if (!governanceEnv.privyAppId) {
    return (
      <section className="space-y-6">
        <Hero />
        <WalletStateCard
          title="Proposal creation requires Privy configuration"
          description="Set NEXT_PUBLIC_PRIVY_APP_ID to enable wallet connection and governor writes locally."
        />
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <Hero />
      <ProposalComposerConnected tokenSymbol={tokenSymbol} />
    </section>
  )
}

function ProposalComposerConnected({ tokenSymbol }: { tokenSymbol: string }) {
  const { address, authenticated, connect, getSigner, isReady } =
    useGovernanceWallet()
  const [mode, setMode] = useState<ProposalComposerMode>('simple')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [calls, setCalls] = useState<CallDraft[]>([createEmptyCall()])
  const [advancedJson, setAdvancedJson] = useState(defaultAdvancedJson)
  const [pendingPayload, setPendingPayload] = useState<ProposalPayload | null>(
    null
  )

  const thresholdQuery = useQuery({
    enabled: Boolean(address),
    queryKey: ['proposal-threshold', address],
    staleTime: 0,
    queryFn: async () => {
      const provider = new JsonRpcProvider(
        governanceConfig.rpcUrl,
        governanceConfig.chainId
      )
      const governor = new Contract(
        governanceConfig.governorAddress,
        governorAbi,
        provider
      )
      const token = new Contract(
        governanceConfig.tokenAddress,
        tokenAbi,
        provider
      )
      const [proposalThreshold, votingPower] = await Promise.all([
        governor.proposalThreshold() as Promise<bigint>,
        token.getVotes(address) as Promise<bigint>,
      ])

      return {
        proposalThreshold,
        votingPower,
      }
    },
  })

  const composerMutation = useMutation({
    mutationFn: async (payload: ProposalPayload) => {
      const signer = await getSigner()
      const governor = new Contract(
        governanceConfig.governorAddress,
        governorAbi,
        signer
      )
      const tx = await governor.propose(
        payload.targets,
        payload.values,
        payload.calldatas,
        payload.description
      )
      await tx.wait()
      return tx.hash as string
    },
    onError: (error) => {
      ToastHelper.error(
        error instanceof Error ? error.message : 'Unable to submit proposal.'
      )
    },
    onSuccess: (txHash) => {
      const explorerLink = txExplorerUrl(txHash)
      ToastHelper.success(
        explorerLink
          ? `Proposal submitted. View on Basescan: ${explorerLink}`
          : 'Proposal submitted to the governor.'
      )
      setTitle('')
      setDescription('')
      setCalls([createEmptyCall()])
      setAdvancedJson(defaultAdvancedJson)
      setPendingPayload(null)
    },
  })

  const thresholdState = thresholdQuery.data
  const meetsThreshold =
    thresholdState &&
    thresholdState.votingPower >= thresholdState.proposalThreshold
  const hasRequiredFields =
    mode === 'simple'
      ? title.trim() !== '' && description.trim() !== ''
      : (() => {
          try {
            JSON.parse(advancedJson)
            return true
          } catch {
            return false
          }
        })()

  return (
    <>
      {!authenticated ? (
        <WalletStateCard
          action={<Button onClick={() => connect()}>Connect wallet</Button>}
          title="Connect a wallet to create proposals"
          description="The governor contract checks your current voting power against the proposal threshold before submission."
        />
      ) : null}

      {authenticated && !address ? (
        <WalletStateCard
          title={isReady ? 'Select a wallet in Privy' : 'Loading wallet state'}
          description="Once a wallet is connected, this page will load your current proposal power and enable submission."
        />
      ) : null}

      {address ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_360px]">
          <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap gap-3">
              <ModeButton
                active={mode === 'simple'}
                label="Simple mode"
                onClick={() => setMode('simple')}
              />
              <ModeButton
                active={mode === 'advanced'}
                label="Advanced JSON"
                onClick={() => setMode('advanced')}
              />
            </div>

            {mode === 'simple' ? (
              <SimpleComposer
                calls={calls}
                description={description}
                onAddCall={() =>
                  setCalls((current) => [...current, createEmptyCall()])
                }
                onChangeCall={(index, nextCall) =>
                  setCalls((current) =>
                    current.map((call, callIndex) =>
                      callIndex === index ? nextCall : call
                    )
                  )
                }
                onDescriptionChange={setDescription}
                onRemoveCall={(index) =>
                  setCalls((current) =>
                    current.length === 1
                      ? [createEmptyCall()]
                      : current.filter((_, callIndex) => callIndex !== index)
                  )
                }
                onTitleChange={setTitle}
                title={title}
              />
            ) : (
              <AdvancedComposer
                advancedJson={advancedJson}
                onChange={setAdvancedJson}
              />
            )}
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/55">
                Proposal threshold
              </h3>
              <div className="mt-4 rounded-3xl bg-ui-secondary-200 p-5">
                <div className="text-sm text-brand-ui-primary/65">
                  Current voting power
                </div>
                <div className="mt-2 text-2xl font-semibold text-brand-ui-primary">
                  {thresholdQuery.isSuccess
                    ? `${formatTokenAmount(thresholdState!.votingPower)} ${tokenSymbol}`
                    : '—'}
                </div>
                <p className="mt-2 text-sm leading-6 text-brand-ui-primary/70">
                  Required:{' '}
                  {thresholdQuery.isSuccess
                    ? `${formatTokenAmount(thresholdState!.proposalThreshold)} ${tokenSymbol}`
                    : '—'}
                </p>
              </div>
            </section>

            <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/55">
                Submit proposal
              </h3>
              <p className="mt-4 text-sm leading-6 text-brand-ui-primary/70">
                {meetsThreshold
                  ? 'Your wallet currently meets the proposal threshold.'
                  : 'Your wallet does not currently meet the proposal threshold.'}
              </p>
              {pendingPayload ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl bg-ui-secondary-200 p-4 text-sm text-brand-ui-primary/80">
                    <p className="font-semibold text-brand-ui-primary">
                      Review before signing
                    </p>
                    <p className="mt-2 text-xs text-brand-ui-primary/55 uppercase tracking-[0.18em]">
                      Targets
                    </p>
                    {pendingPayload.targets.map((t, i) => (
                      <p key={i} className="mt-1 break-all font-mono text-xs">
                        {t}
                      </p>
                    ))}
                    <p className="mt-3 text-xs text-brand-ui-primary/55 uppercase tracking-[0.18em]">
                      ETH values (wei)
                    </p>
                    {pendingPayload.values.map((v, i) => (
                      <p key={i} className="mt-1 font-mono text-xs">
                        {v.toString()}
                      </p>
                    ))}
                    <p className="mt-3 text-xs text-brand-ui-primary/55 uppercase tracking-[0.18em]">
                      Description
                    </p>
                    <p className="mt-1 text-xs">
                      {pendingPayload.description.slice(0, 120)}
                      {pendingPayload.description.length > 120 ? '…' : ''}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      disabled={composerMutation.isPending}
                      loading={composerMutation.isPending}
                      onClick={() => composerMutation.mutate(pendingPayload)}
                    >
                      Confirm &amp; sign
                    </Button>
                    <Button
                      disabled={composerMutation.isPending}
                      onClick={() => setPendingPayload(null)}
                      variant="outlined-primary"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-5">
                  <Button
                    disabled={
                      !meetsThreshold ||
                      !hasRequiredFields ||
                      composerMutation.isPending
                    }
                    onClick={() => {
                      try {
                        const payload =
                          mode === 'simple'
                            ? buildSimpleProposalPayload(
                                title,
                                description,
                                calls
                              )
                            : buildAdvancedProposalPayload(advancedJson)
                        setPendingPayload(payload)
                      } catch (error) {
                        ToastHelper.error(
                          error instanceof Error
                            ? error.message
                            : 'Invalid proposal.'
                        )
                      }
                    }}
                  >
                    Submit proposal
                  </Button>
                </div>
              )}
            </section>
          </aside>
        </div>
      ) : null}
    </>
  )
}

function Hero() {
  return (
    <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-ui-primary/55">
        Create Proposal
      </p>
      <h2 className="mt-4 text-4xl font-semibold text-brand-ui-primary">
        Build a governor proposal without leaving Unlock
      </h2>
      <p className="mt-4 max-w-3xl text-base leading-7 text-brand-ui-primary/72">
        Use the guided composer for known protocol contracts or switch to the
        advanced JSON format for arbitrary calldata. Both modes submit directly
        to the Base governor.
      </p>
    </section>
  )
}

function SimpleComposer({
  calls,
  description,
  onAddCall,
  onChangeCall,
  onDescriptionChange,
  onRemoveCall,
  onTitleChange,
  title,
}: {
  calls: CallDraft[]
  description: string
  onAddCall: () => void
  onChangeCall: (index: number, nextCall: CallDraft) => void
  onDescriptionChange: (value: string) => void
  onRemoveCall: (index: number) => void
  onTitleChange: (value: string) => void
  title: string
}) {
  return (
    <div className="mt-6 space-y-8">
      <Input
        label="Title"
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="Upgrade Unlock governance parameters"
        value={title}
      />
      <TextBox
        description="This becomes the markdown body of the proposal."
        label="Description"
        onChange={(event) => onDescriptionChange(event.target.value)}
        placeholder="Explain the change, rationale, and expected outcome."
        rows={8}
        value={description}
      />

      <div className="space-y-5">
        {calls.map((call, index) => (
          <CallEditor
            call={call}
            index={index}
            key={`${index}-${call.knownContract}`}
            onChange={(nextCall) => onChangeCall(index, nextCall)}
            onRemove={() => onRemoveCall(index)}
          />
        ))}
      </div>

      <Button onClick={onAddCall} variant="outlined-primary">
        Add call
      </Button>
    </div>
  )
}

function CallEditor({
  call,
  index,
  onChange,
  onRemove,
}: {
  call: CallDraft
  index: number
  onChange: (nextCall: CallDraft) => void
  onRemove: () => void
}) {
  const contractChoices = [
    ...governanceConfig.knownContracts.map(({ label }) => label),
    customContractOption,
  ]
  const contractChoice =
    call.kind === 'custom' ? customContractOption : call.knownContract
  const customAbiResult =
    call.kind === 'custom' ? parseCustomAbi(call.customAbi) : null
  const customAbiError =
    customAbiResult && 'error' in customAbiResult ? customAbiResult.error : null
  const contractAbi =
    call.kind === 'custom'
      ? customAbiResult && 'abi' in customAbiResult
        ? customAbiResult.abi
        : null
      : governanceConfig.knownContracts.find(
          ({ label }) => label === call.knownContract
        )?.abi
  const fragments = getFunctionChoices(contractAbi)
  // Use the full signature as the key to handle overloaded functions.
  const selectedFragment =
    fragments.find((fragment) => fragment.format() === call.functionName) ||
    null

  return (
    <div className="rounded-[2rem] border border-brand-ui-primary/10 bg-ui-secondary-100 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-ui-primary/45">
            Call {index + 1}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-brand-ui-primary">
            Target contract and calldata
          </h3>
        </div>
        <Button onClick={onRemove} variant="borderless-primary">
          Remove
        </Button>
      </div>

      <div className="mt-5 space-y-4">
        <Field label="Contract">
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-brand-ui-primary"
            onChange={(event) =>
              onChange(
                event.target.value === customContractOption
                  ? {
                      ...createEmptyCall(),
                      kind: 'custom',
                    }
                  : {
                      ...createEmptyCall(),
                      knownContract: event.target.value,
                    }
              )
            }
            value={contractChoice}
          >
            {contractChoices.map((choice) => (
              <option key={choice} value={choice}>
                {choice}
              </option>
            ))}
          </select>
        </Field>

        {call.kind === 'custom' ? (
          <>
            <Input
              label="Custom contract address"
              onChange={(event) =>
                onChange({ ...call, customAddress: event.target.value })
              }
              placeholder="0x..."
              value={call.customAddress}
            />
            <TextBox
              description="Paste an ABI array. String package imports are not supported in the browser."
              label="Custom ABI"
              onChange={(event) =>
                onChange({ ...call, customAbi: event.target.value })
              }
              rows={8}
              value={call.customAbi}
            />
            {customAbiError && (
              <p className="text-sm text-red-600">{customAbiError}</p>
            )}
          </>
        ) : (
          <div className="rounded-2xl bg-white px-4 py-3 text-sm text-brand-ui-primary/72">
            Target address: {resolveKnownContractAddress(call.knownContract)}
          </div>
        )}

        <Field label="Function">
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-brand-ui-primary"
            onChange={(event) => {
              const fragment =
                fragments.find((f) => f.format() === event.target.value) || null
              onChange({
                ...call,
                args: fragment ? fragment.inputs.map(() => '') : [],
                functionName: event.target.value,
              })
            }}
            value={call.functionName}
          >
            <option value="">Select a function</option>
            {fragments.map((fragment) => (
              <option key={fragment.format()} value={fragment.format()}>
                {fragment.format()}
              </option>
            ))}
          </select>
        </Field>

        {selectedFragment?.inputs.map((input, inputIndex) => (
          <Input
            description={input.type}
            key={`${selectedFragment.format()}-${inputIndex}`}
            label={input.name || `Argument ${inputIndex + 1}`}
            onChange={(event) =>
              onChange({
                ...call,
                args: call.args.map((value, valueIndex) =>
                  valueIndex === inputIndex ? event.target.value : value
                ),
              })
            }
            placeholder={input.type}
            value={call.args[inputIndex] || ''}
          />
        ))}

        <Input
          description="Raw ETH value in wei."
          label="ETH value"
          onChange={(event) => onChange({ ...call, value: event.target.value })}
          placeholder="0"
          value={call.value}
        />
      </div>
    </div>
  )
}

function AdvancedComposer({
  advancedJson,
  onChange,
}: {
  advancedJson: string
  onChange: (value: string) => void
}) {
  let jsonError: string | null = null
  try {
    JSON.parse(advancedJson)
  } catch (e) {
    jsonError = e instanceof Error ? e.message : 'Invalid JSON'
  }

  return (
    <div className="mt-6 space-y-6">
      <TextBox
        description='Use the browser-safe format: { "proposalName": "...", "description": "...", "calls": [{ "contractAbi": [...], "contractAddress": "0x...", "functionName": "...", "functionArgs": [] }] }. Large integers (uint256, etc.) must be quoted strings — e.g. "1000000000000000000" not 1000000000000000000 — to avoid precision loss in JSON.'
        label="Proposal JSON"
        onChange={(event) => onChange(event.target.value)}
        rows={20}
        value={advancedJson}
      />
      {jsonError && (
        <p className="text-sm text-red-600">JSON error: {jsonError}</p>
      )}
    </div>
  )
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-brand-ui-primary">{label}</span>
      {children}
    </label>
  )
}

function ModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <Button onClick={onClick} variant={active ? 'primary' : 'outlined-primary'}>
      {label}
    </Button>
  )
}

function WalletStateCard({
  action,
  description,
  title,
}: {
  action?: ReactNode
  description: string
  title: string
}) {
  return (
    <section className="rounded-[2rem] border border-brand-ui-primary/10 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-brand-ui-primary">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-brand-ui-primary/70">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  )
}

function createEmptyCall(): CallDraft {
  return {
    args: [],
    customAbi: '[]',
    customAddress: '',
    functionName: '',
    kind: 'known',
    knownContract: governanceConfig.knownContracts[0].label,
    value: '0',
  }
}

function buildSimpleProposalPayload(
  title: string,
  description: string,
  calls: CallDraft[]
) {
  if (!title.trim()) {
    throw new Error('Enter a proposal title.')
  }

  if (!description.trim()) {
    throw new Error('Enter a proposal description.')
  }

  const preparedCalls = calls.map((call) => prepareSimpleCall(call))

  return {
    calldatas: preparedCalls.map(({ calldata }) => calldata),
    description: `${title.trim()}\n\n${description.trim()}`,
    targets: preparedCalls.map(({ target }) => target),
    values: preparedCalls.map(({ value }) => value),
  }
}

function buildAdvancedProposalPayload(advancedJson: string) {
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

    if (!isAddress(call.contractAddress)) {
      throw new Error(`Invalid contract address: ${call.contractAddress}`)
    }

    const contractInterface = new Interface(call.contractAbi as InterfaceAbi)
    const fragment = contractInterface.getFunction(call.functionName)

    if (!fragment) {
      throw new Error(`Function not found in ABI: ${call.functionName}`)
    }

    let ethValue = 0n
    if (call.value && call.value !== '0') {
      try {
        ethValue = BigInt(call.value)
      } catch {
        throw new Error(
          `Invalid value "${call.value}" for call to ${call.functionName}. Use a whole number in wei.`
        )
      }
    }

    return {
      calldata: contractInterface.encodeFunctionData(
        fragment,
        call.functionArgs || []
      ),
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

  const contractInterface = new Interface(getContractAbi(abi))
  const fragment = contractInterface.getFunction(call.functionName)

  if (!fragment) {
    throw new Error(`Function not found in ABI: ${call.functionName}`)
  }
  const parsedArgs = fragment.inputs.map((input, index) =>
    parseArgument(input.type, call.args[index] || '')
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
  }

  return {
    calldata: contractInterface.encodeFunctionData(fragment, parsedArgs),
    target: getAddress(target),
    value: ethValue,
  }
}

const knownContractAddresses: Record<string, string> = Object.fromEntries(
  governanceConfig.knownContracts
    .filter(({ address }) => address)
    .map(({ label, address }) => [label, address])
)

function resolveKnownContractAddress(contractLabel: string) {
  return knownContractAddresses[contractLabel] || ''
}

function parseAdvancedProposal(advancedJson: string) {
  try {
    return JSON.parse(advancedJson) as AdvancedProposal
  } catch {
    throw new Error('Proposal JSON is invalid.')
  }
}

function parseCustomAbi(value: string): { abi: unknown[] } | { error: string } {
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

function getFunctionChoices(abi: unknown) {
  if (!abi) {
    return [] as FunctionFragment[]
  }

  try {
    return new Interface(getContractAbi(abi)).fragments.filter(
      (fragment) => fragment.type === 'function'
    ) as FunctionFragment[]
  } catch {
    return [] as FunctionFragment[]
  }
}

function parseArgument(type: string, value: string): unknown {
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

    if (!Array.isArray(parsed)) {
      throw new Error(`Expected an array for ${type}.`)
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

  if (type.startsWith('uint') || type.startsWith('int')) {
    try {
      return BigInt(value)
    } catch {
      throw new Error(`Invalid integer value for ${type}: "${value}"`)
    }
  }

  if (type.startsWith('bytes')) {
    if (!/^0x[0-9a-fA-F]*$/.test(value)) {
      throw new Error(`${type} must be 0x-prefixed hex (e.g. 0xabcd).`)
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
