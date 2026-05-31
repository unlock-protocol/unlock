import type { Request, Response, RequestHandler } from 'express'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  findOne: vi.fn(),
  isTransferSignedByLocksmith: vi.fn(),
  isUnlockAccountAddress: vi.fn(),
  send: vi.fn(),
  status: vi.fn(),
  upsert: vi.fn(),
}))

vi.mock('../../../src/fulfillment/dispatcher', () => ({
  default: vi.fn().mockImplementation(() => ({
    isTransferSignedByLocksmith: mocks.isTransferSignedByLocksmith,
  })),
}))

vi.mock('../../../src/models', () => ({
  UserTokenMetadata: {
    findOne: mocks.findOne,
    upsert: mocks.upsert,
  },
}))

vi.mock('../../../src/operations/userOperations', () => ({
  default: {
    isUnlockAccountAddress: mocks.isUnlockAccountAddress,
  },
}))

vi.mock('../../../src/operations/wedlocksOperations', () => ({
  sendEmail: vi.fn(),
}))

vi.mock(
  '@unlock-protocol/unlock-js',
  () => ({
    SubgraphService: vi.fn(),
  }),
  {
    virtual: true,
  }
)

describe('transferDone', () => {
  let transferDone: RequestHandler
  const recipient = '0x000000000000000000000000000000000000dEaD'
  const owner = '0x1111111111111111111111111111111111111111'
  const lock = '0x2222222222222222222222222222222222222222'
  const body = {
    transferSignature: '0xsignature',
    deadline: 1780000000,
    token: '42',
    lock,
    network: 1,
    owner,
  }

  const request = {
    body,
    user: {
      walletAddress: recipient,
    },
  } as unknown as Request

  const response = {
    status: mocks.status,
    send: mocks.send,
  } as unknown as Response

  beforeAll(async () => {
    ;({ transferDone } = await import(
      '../../../src/controllers/v2/transferController'
    ))
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mocks.status.mockReturnValue(response)
    mocks.isTransferSignedByLocksmith.mockReturnValue(true)
  })

  it('rejects transfers into Unlock accounts before copying metadata', async () => {
    expect.assertions(5)

    mocks.isUnlockAccountAddress.mockResolvedValue(true)

    await transferDone(request, response, vi.fn())

    expect(mocks.isUnlockAccountAddress).toHaveBeenCalledWith(recipient)
    expect(mocks.status).toHaveBeenCalledWith(403)
    expect(mocks.send).toHaveBeenCalledWith({
      message:
        'Transfers to Unlock accounts are not supported. Please connect a self-custodied wallet.',
    })
    expect(mocks.findOne).not.toHaveBeenCalled()
    expect(mocks.upsert).not.toHaveBeenCalled()
  })

  it('copies metadata when the transfer recipient is a self-custodied wallet', async () => {
    expect.assertions(4)

    const metadata = {
      data: {
        userMetadata: {
          protected: {
            email: 'owner@example.com',
          },
        },
      },
    }
    mocks.isUnlockAccountAddress.mockResolvedValue(false)
    mocks.findOne.mockResolvedValue(metadata)

    await transferDone(request, response, vi.fn())

    expect(mocks.findOne).toHaveBeenCalledWith({
      where: {
        tokenAddress: lock,
        chain: 1,
        userAddress: owner,
      },
    })
    expect(mocks.upsert).toHaveBeenCalledWith(
      {
        tokenAddress: lock,
        chain: 1,
        userAddress: recipient,
        data: metadata.data,
      },
      {
        conflictFields: ['userAddress', 'tokenAddress'],
      }
    )
    expect(mocks.status).toHaveBeenCalledWith(200)
    expect(mocks.send).toHaveBeenCalledWith({
      message: 'Transfer done',
    })
  })
})
