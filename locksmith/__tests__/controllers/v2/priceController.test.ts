import request from 'supertest'
import { networks } from '@unlock-protocol/networks'

import app from '../../app'

const networkIds = Object.values(networks)
  .filter((network) => ![31337, 4, 69].includes(network.id))
  .map((item) => item.id)

describe.each(networkIds)('Test the price on each network', async (id) => {
  beforeEach(() => {
    fetchMock.mockIf(
      /^https?:\/\/coins.llama.fi\/prices\/current\/.*$/,
      (req) => {
        return '{"coins":{"coingecko:ethereum":{"price":1,"symbol":"ETH","timestamp":1675174381,"confidence":0.99}}}'
      }
    )
  })

  it('Native currency price on network: %s', async () => {
    expect.assertions(1)
    const networkConfig = networks[id]
    const native = await request(app).get(`/v2/api/${networkConfig.id}/price`)
    expect(native.status).toBe(200)
  })

  it('USDC on network: %s', async () => {
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

  it('DAI on network: %s', async () => {
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
