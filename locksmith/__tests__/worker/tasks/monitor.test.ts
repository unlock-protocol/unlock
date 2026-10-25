// ABOUTME: Tests for the worker heartbeat task, which must ping the configured
// external heartbeat URL so a dead worker gets noticed.
import { vi } from 'vitest'

const { sentryCaptureCheckIn, configMock } = vi.hoisted(() => ({
  sentryCaptureCheckIn: vi.fn().mockReturnValue('check-in-id'),
  configMock: {} as { workerHeartbeatUrl?: string },
}))

vi.mock('@sentry/node', () => ({
  captureCheckIn: (...args: unknown[]) => sentryCaptureCheckIn(...args),
}))

vi.mock('../../../src/config/config', () => ({
  default: configMock,
}))

import { monitor } from '../../../src/worker/tasks/monitor'

describe('monitor task', () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true })

  beforeEach(() => {
    fetchMock.mockClear()
    sentryCaptureCheckIn.mockClear()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    delete configMock.workerHeartbeatUrl
  })

  it('pings the heartbeat URL when one is configured', async () => {
    configMock.workerHeartbeatUrl = 'https://heartbeat.example.com/ping'
    await monitor({}, {} as never)
    expect(fetchMock).toHaveBeenCalledWith('https://heartbeat.example.com/ping')
    expect(sentryCaptureCheckIn).toHaveBeenCalledTimes(2)
  })

  it('still reports to Sentry when no heartbeat URL is configured', async () => {
    await monitor({}, {} as never)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(sentryCaptureCheckIn).toHaveBeenCalledTimes(2)
  })

  it('does not throw when the heartbeat ping fails', async () => {
    configMock.workerHeartbeatUrl = 'https://heartbeat.example.com/ping'
    fetchMock.mockRejectedValueOnce(new Error('network down'))
    await expect(monitor({}, {} as never)).resolves.toBeUndefined()
  })
})
