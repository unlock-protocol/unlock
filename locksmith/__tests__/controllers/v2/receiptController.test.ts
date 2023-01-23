import request from 'supertest'
import { loginRandomUser } from '../../test-helpers/utils'
import * as z from 'zod'
import logger from '../../../src/logger'
import app from '../../app'
import { vi } from 'vitest'
import { SupplierBody } from '../../../src/controllers/v2/receiptBaseController'
import { PurchaserBody } from '../../../src/controllers/v2/receiptController'
import { ethers } from 'ethers'

const lockAddress = '0x62ccb13a72e6f991de53b9b7ac42885151588cd2'
const lockManager = `0x00192fb10df37c9fb26829eb2cc623cd1bf599e8`
const hash =
  '0x68bd005bd3fba4c467f3289afdb773a797d3f5fe63ca13fd3ec7f16794b3858b'
const payer = '0xE91efB608747f8f99CBB7d77020B80ECaEc16E26'
const network = 5

const purchaser: z.infer<typeof PurchaserBody> = {
  fullname: 'Mario Rossi',
  businessName: 'Unlock Labs',
  addressLine1: 'etherscan.io',
  addressLine2: '',
  country: '',
  city: 'Milano',
  state: 'Italy',
  zip: '10000',
}

const supplier: z.infer<typeof SupplierBody> = {
  supplierName: 'Monkey D. Luffy',
  vat: 'PRTK0000',
  servicePerformed: 'Next pirate king',
  addressLine1: 'All blue',
  addressLine2: 'East blue',
  country: '',
  city: 'Sea',
  state: 'Red Line',
  zip: '00000',
}

vi.mock('@unlock-protocol/unlock-js', () => {
  return {
    Web3Service: vi.fn().mockImplementation(() => {
      return {
        isLockManager: (lock: string, manager: string) => {
          return (
            lockAddress.toLowerCase() === lock.toLowerCase() ||
            manager === lockManager
          )
        },
      }
    }),
    SubgraphService: vi.fn().mockImplementation(() => {
      return {
        lock: (filter: any, opts: any) => {
          return {
            name: 'Test Lock',
            address: lockAddress,
          }
        },
        key: (filter: any, opts: any) => {
          logger.info(filter, opts)
          return {
            owner: lockManager,
            expiration: 0,
            tokenId: 1,
          }
        },
        receipt: (filter: any, opts: any) => {
          return {
            payer,
            timestamp: new Date().getTime(),
            sender: ethers.Wallet.createRandom(),
            owner: ethers.Wallet.createRandom(),
            tokenAddress: ethers.Wallet.createRandom(),
            amount: 0.5,
            gasTotal: 0,
          }
        },
      }
    }),
  }
})

describe('Receipt v2', () => {
  it('Save receipt throws an error when is not authenticated', async () => {
    expect.assertions(2)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app).post(
      `/v2/receipts/${network}/${lockAddress}/${hash}`
    )

    expect(response.status).toBe(401)
  })

  it('Get receipt throws an error when is not authenticated', async () => {
    expect.assertions(2)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app).get(
      `/v2/receipts/${network}/${lockAddress}/${hash}`
    )

    expect(response.status).toBe(401)
  })

  it('Correctly get receipt details when is lock manager', async () => {
    expect.assertions(6)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    // save supplier details
    await request(app)
      .post(`/v2/receipts-base/${network}/${lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send(supplier)

    // save purchaser details
    await request(app)
      .post(`/v2/receipts/${network}/${lockAddress}/${hash}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send(purchaser)

    // get receipts and check that saved data match
    const receiptResponse = await request(app)
      .get(`/v2/receipts/${network}/${lockAddress}/${hash}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send(purchaser)

    expect(receiptResponse.status).toBe(200)

    expect(receiptResponse.body.supplier).toBeDefined()
    expect(receiptResponse.body.purchaser).toBeDefined()

    expect(receiptResponse.body.supplier).toContain(supplier)
    expect(receiptResponse.body.purchaser).toContain(purchaser)
  })

  it('Get receipt fails when user is lock manager', async () => {
    expect.assertions(2)
    const { loginResponse, address } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const lockAddress = address
    // save supplier details
    await request(app)
      .post(`/v2/receipts-base/${network}/${lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send(supplier)

    // save purchaser details
    await request(app)
      .post(`/v2/receipts/${network}/${lockAddress}/${hash}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send(purchaser)

    // get receipts and check that saved data match
    const receiptResponse = await request(app)
      .get(`/v2/receipts/${network}/${lockAddress}/${hash}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(receiptResponse.status).toBe(401)
  })
})
