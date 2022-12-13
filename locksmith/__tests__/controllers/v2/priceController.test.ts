import request from 'supertest'
import { networks } from '@unlock-protocol/networks'

import app from '../../../src/app'

const networkIds = Object.values(networks)
  .filter((network) => ![31337, 4, 69].includes(network.id))
  .map((item) => item.id)

describe('Test the price on each network', () => {
  it.each(networkIds)('Native currency price on network: %s', async (id) => {
    expect.assertions(1)
    const networkConfig = networks[id]
    const native = await request(app).get(`/v2/api/${networkConfig.id}/price`)
    expect(native.status).toBe(200)
  })

  it.each(networkIds)('USDC on network: %s', async (id) => {
    expect.assertions(2)
    const networkConfig = networks[id]
    const usdc = networkConfig.tokens!.find(
      (item) => item.symbol.toLowerCase() === 'usdc'
    )
    const erc20 = await request(app)
      .get(`/v2/api/${networkConfig.id}/price`)
      .query({
        address: usdc?.address,
      })
    expect(erc20.status).toBe(200)
    const diff = Math.ceil((erc20.body.result.price / 1) * 100)
    expect(diff).toBeGreaterThan(95)
  })
  it.each(networkIds)('DAI on network: %s', async (id) => {
    expect.assertions(2)
    const networkConfig = networks[id]
    const dai = networkConfig.tokens!.find(
      (item) => item.symbol.toLowerCase() === 'dai'
    )
    const erc20 = await request(app)
      .get(`/v2/api/${networkConfig.id}/price`)
      .query({
        address: dai?.address,
      })
    expect(erc20.status).toBe(200)
    const diff = Math.ceil((erc20.body.result.price / 1) * 100)
    expect(diff).toBeGreaterThan(95)
  })
})
