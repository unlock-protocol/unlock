import request from 'supertest'
import { loginRandomUser } from '../../test-helpers/utils'
import * as z from 'zod'

import app from '../../app'
import { vi } from 'vitest'
import { SupplierBody } from '../../../src/controllers/v2/receiptBaseController'

const lockAddress = '0x62ccb13a72e6f991de53b9b7ac42885151588cd2'
let lockManager = `0x00192fb10df37c9fb26829eb2cc623cd1bf599e8`
const network = 5

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
  }
})

describe('Receipt Base v2', () => {
  it('Save supplier throws an error when is not authenticated', async () => {
    expect.assertions(2)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app).post(
      `/v2/receipts-base/${network}/${lockAddress}`
    )

    expect(response.status).toBe(401)
  })

  it('Get supplier throws an error when is not authenticated', async () => {
    expect.assertions(2)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app).get(
      `/v2/receipts-base/${network}/${lockAddress}`
    )

    expect(response.status).toBe(401)
  })

  it('Correctly save supplier details and returns correctly value', async () => {
    expect.assertions(10)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .post(`/v2/receipts-base/${network}/${lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send(supplier)

    const body = response.body ?? {}
    expect(response.status).toBe(200)

    expect(body.supplierName).toBe(supplier.supplierName)
    expect(body.servicePerformed).toBe(supplier.servicePerformed)
    expect(body.vat).toBe(supplier.vat)
    expect(body.addressLine1).toBe(supplier.addressLine1)
    expect(body.state).toBe(supplier.state)
    expect(body.city).toBe(supplier.city)
    expect(body.country).toBe(supplier.country)
    expect(body.zip).toBe(supplier.zip)
  })

  it('Correctly save supplier details without params and returns default values', async () => {
    expect.assertions(10)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    const response = await request(app)
      .post(`/v2/receipts-base/${network}/${lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send({})

    const body = response.body ?? {}
    expect(response.status).toBe(200)
    expect(body.supplierName).toBe('')
    expect(body.servicePerformed).toBe('')
    expect(body.vat).toBe('')
    expect(body.addressLine1).toBe('')
    expect(body.state).toBe('')
    expect(body.city).toBe('')
    expect(body.country).toBe('')
    expect(body.zip).toBe('')
  })

  it('Correctly save and get supplier details', async () => {
    expect.assertions(11)
    const { loginResponse } = await loginRandomUser(app)
    expect(loginResponse.status).toBe(200)

    // save supplier details
    const saveSupplierResponse = await request(app)
      .post(`/v2/receipts-base/${network}/${lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)
      .send(supplier)

    expect(saveSupplierResponse.status).toBe(200)

    // get supplier details
    const getSupplierResponse = await request(app)
      .get(`/v2/receipts-base/${network}/${lockAddress}`)
      .set('authorization', `Bearer ${loginResponse.body.accessToken}`)

    expect(getSupplierResponse.status).toBe(200)

    const body = getSupplierResponse.body ?? {}
    expect(body.supplierName).toBe(supplier.supplierName)
    expect(body.servicePerformed).toBe(supplier.servicePerformed)
    expect(body.vat).toBe(supplier.vat)
    expect(body.addressLine1).toBe(supplier.addressLine1)
    expect(body.state).toBe(supplier.state)
    expect(body.city).toBe(supplier.city)
    expect(body.country).toBe(supplier.country)
    expect(body.zip).toBe(supplier.zip)
  })
})
