// ABOUTME: Tests for the new-keys job pagination, which must stop querying the
// subgraph once it reaches keys that were already processed on an earlier run.
import { vi } from 'vitest'

const FETCH_LIMIT = 20

const { subgraphKeys, processedFindAll, bulkCreate, notifyNewKeysToWedlocks } =
  vi.hoisted(() => ({
    subgraphKeys: vi.fn(),
    processedFindAll: vi.fn(),
    bulkCreate: vi.fn(),
    notifyNewKeysToWedlocks: vi.fn(),
  }))

vi.mock('@unlock-protocol/unlock-js', () => ({
  SubgraphService: class {
    keys = subgraphKeys
  },
  KeyOrderBy: { CreatedAtBlock: 'createdAtBlock' },
  OrderDirection: { Desc: 'desc' },
}))

vi.mock('@unlock-protocol/networks', () => ({
  networks: { 8453: { id: 8453 } },
}))

vi.mock('../../../src/models', () => ({
  Hook: {},
  ProcessedHookItem: {
    findAll: (...args: unknown[]) => processedFindAll(...args),
    bulkCreate: (...args: unknown[]) => bulkCreate(...args),
  },
}))

vi.mock('../../../src/operations/wedlocksOperations', () => ({
  notifyNewKeysToWedlocks: (...args: unknown[]) =>
    notifyNewKeysToWedlocks(...args),
}))

vi.mock('../../../src/worker/helpers', () => ({
  notifyHook: vi.fn(),
  filterHooksByTopic: () => [],
}))

import { notifyOfKeys } from '../../../src/worker/jobs/keys'

const makeKeys = (page: number, count = FETCH_LIMIT) =>
  Array.from({ length: count }, (_, i) => ({
    id: `key-${page}-${i}`,
    lock: { id: 'lock', address: '0xlock' },
  }))

// The subgraph serves pages of keys, newest first.
const serveKeys = (pages: ReturnType<typeof makeKeys>[]) => {
  subgraphKeys.mockImplementation(async ({ skip }: { skip: number }) => {
    return pages[skip / FETCH_LIMIT] ?? []
  })
}

// Every key id in `processed` is treated as already handled.
const markProcessed = (processed: Set<string>) => {
  processedFindAll.mockImplementation(async ({ where }: any) =>
    where.objectId[Object.getOwnPropertySymbols(where.objectId)[0]]
      .filter((id: string) => processed.has(id))
      .map((objectId: string) => ({ objectId }))
  )
}

describe('notifyOfKeys', () => {
  beforeEach(() => {
    subgraphKeys.mockReset()
    processedFindAll.mockReset()
    bulkCreate.mockReset()
    notifyNewKeysToWedlocks.mockReset()
  })

  it('makes a single query when the newest page is already processed', async () => {
    const pages = Array.from({ length: 30 }, (_, p) => makeKeys(p))
    serveKeys(pages)
    markProcessed(new Set(pages.flat().map((k) => k.id)))

    await notifyOfKeys([])

    expect(subgraphKeys).toHaveBeenCalledTimes(1)
    expect(notifyNewKeysToWedlocks).not.toHaveBeenCalled()
  })

  it('pages until it reaches a fully processed page', async () => {
    const pages = Array.from({ length: 30 }, (_, p) => makeKeys(p))
    serveKeys(pages)
    const newKeys = [...pages[0], ...pages[1].slice(0, 5)]
    const processed = new Set(
      pages
        .flat()
        .map((k) => k.id)
        .filter((id) => !newKeys.find((k) => k.id === id))
    )
    markProcessed(processed)

    await notifyOfKeys([])

    // page 0 (all new), page 1 (5 new), page 2 (all processed) -> stop
    expect(subgraphKeys).toHaveBeenCalledTimes(3)
    const notified = notifyNewKeysToWedlocks.mock.calls.flatMap(
      ([keys]) => keys
    )
    expect(notified.map((k: any) => k.id).sort()).toEqual(
      newKeys.map((k) => k.id).sort()
    )
  })

  it('stops when the subgraph returns a short page', async () => {
    serveKeys([makeKeys(0, 5)])
    markProcessed(new Set())

    await notifyOfKeys([])

    expect(subgraphKeys).toHaveBeenCalledTimes(1)
    expect(notifyNewKeysToWedlocks).toHaveBeenCalledTimes(1)
  })

  it('scans the first 12 pages in full-scan mode even when they are processed', async () => {
    const pages = Array.from({ length: 30 }, (_, p) => makeKeys(p))
    serveKeys(pages)
    markProcessed(new Set(pages.flat().map((k) => k.id)))

    await notifyOfKeys([], { fullScan: true })

    expect(subgraphKeys).toHaveBeenCalledTimes(12)
  })

  it('stops after a subgraph error instead of looping', async () => {
    subgraphKeys.mockRejectedValue(new Error('gateway down'))
    markProcessed(new Set())

    await notifyOfKeys([])

    expect(subgraphKeys).toHaveBeenCalledTimes(1)
  })
})
