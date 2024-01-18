import request from 'supertest'
import { loginRandomUser } from '../../test-helpers/utils'
import * as z from 'zod'
import logger from '../../../src/logger'
import app from '../../app'
import { vi } from 'vitest'
import { SupplierBody } from '../../../src/controllers/v2/receiptBaseController'
import { PurchaserBody } from '../../../src/controllers/v2/receiptController'
import { ethers } from 'ethers'
import { Rsvp } from '../../../src/models'

const lockAddress = '0x62CcB13A72E6F991dE53b9B7AC42885151588Cd2'
const network = 5

describe('RSVP', () => {
  beforeEach(async () => {
    await Rsvp.truncate()
  })
  it('stores the RSVP in the right table', async () => {
    expect.assertions(5)
    const response = await request(app)
      .post(`/v2/rsvp/${network}/${lockAddress}/`)
      .send({
        recipient: '0x81Dd955D02D337DB81BA6c9C5F6213E647672052',
        email: 'julien@unlock-protocol.com',
        data: {
          fullname: 'Julien Genestoux',
        },
      })

    expect(response.status).toBe(200)
    expect(response.body.lockAddress).toEqual(lockAddress)
    expect(response.body.userAddress).toEqual(
      '0x81Dd955D02D337DB81BA6c9C5F6213E647672052'
    )
    expect(response.body.approval).toEqual('pending')
    expect(response.body.network).toEqual('5')
  })

  it('stores the RSVP in the right table even if there is no wallet', async () => {
    expect.assertions(3)
    const response = await request(app)
      .post(`/v2/rsvp/${network}/${lockAddress}/`)
      .send({
        email: 'julien@unlock-protocol.com',
        data: {
          fullname: 'Julien Genestoux',
        },
      })

    expect(response.status).toBe(200)
    expect(response.body.approval).toBe('pending')
    expect(response.body.userAddress).toEqual(
      '0xa00B5f0Eb8b6D009A30D1510785F1383691D4829'
    )
  })

  it('does not override the state of an approved participant', async () => {
    expect.assertions(4)
    const response = await request(app)
      .post(`/v2/rsvp/${network}/${lockAddress}/`)
      .send({
        email: 'ccarfi@unlock-protocol.com',
        data: {
          fullname: 'Chris Carfi',
        },
      })

    expect(response.status).toBe(200)
    expect(response.body.approval).toEqual('pending')

    const rsvp = await Rsvp.findOne({
      where: {
        userAddress: response.body.userAddress,
        lockAddress: response.body.lockAddress,
        network: response.body.network,
      },
    })
    expect(rsvp!.approval).toEqual('pending')
    rsvp!.approval = 'approved'
    await rsvp?.save()
    const responseAfterUpdate = await request(app)
      .post(`/v2/rsvp/${network}/${lockAddress}/`)
      .send({
        email: 'ccarfi@unlock-protocol.com',
        data: {
          fullname: 'Chris Carfi',
        },
      })
    expect(responseAfterUpdate.body.approval).toEqual('approved')
  })
})
