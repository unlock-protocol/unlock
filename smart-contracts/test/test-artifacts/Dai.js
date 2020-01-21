const helpers = require('hardlydifficult-ethereum-contracts')
// const { send } = require('@openzeppelin/test-helpers')

contract('test-artifacts / dai', accounts => {
  const protocolOwner = accounts[0]
  const holder = accounts[9]
  const approvedSpender = accounts[5]
  const permittedSpender = accounts[7]
  const randomSender = accounts[6]
  let dai
  let typedData
  let r
  let s
  let v

  before(async () => {
    dai = await helpers.tokens.dai.deploy(web3, protocolOwner)
    await dai.mint(holder, '1000', {
      from: protocolOwner,
    })

    const Permit = [
      { name: 'holder', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'expiry', type: 'uint256' },
      { name: 'allowed', type: 'bool' },
    ]
    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ]
    const domain = {
      name: 'Dai Stablecoin',
      version: '1',
      chainId: '1',
      verifyingContract: dai.address,
    }

    let message = {
      holder,
      spender: permittedSpender,
      nonce: 11,
      expiry: 0,
      allowed: true,
    }

    typedData = JSON.stringify({
      types: {
        EIP712Domain,
        Permit,
      },
      domain,
      primaryType: 'Permit',
      message,
    })
  })

  it('the owner can mint tokens', async () => {
    await dai.mint(protocolOwner, '10000000000', {
      from: protocolOwner,
    })
    assert.equal(await dai.balanceOf(protocolOwner), 10000000000)
  })

  it('the holder can approve a spender', async () => {
    assert.equal(await dai.balanceOf.call(holder), 1000)
    assert.equal(await dai.allowance.call(holder, approvedSpender), 0)
    await dai.approve(approvedSpender, 42, { from: holder })
    assert.equal(await dai.allowance.call(holder, approvedSpender), 42)
  })

  it('the holder can permit a spender', async () => {
    return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync(
        {
          method: 'eth_signTypedData_v4',
          params: [holder, typedData],
          from: holder,
        },
        async (e, res) => {
          if (e) {
            reject(e)
            return
          }

          const signature = res.result.substring(2)
          r = `0x${signature.substring(0, 64)}`
          s = `0x${signature.substring(64, 128)}`
          v = parseInt(signature.substring(128, 130), 16)
        }
      )

    // const signature = await signMessage(typedData, holder)
    assert.equal(await dai.balanceOf.call(holder), 1000)
    assert.equal(await dai.allowance.call(holder, permittedSpender), 0)

    await dai.permit(
      holder,
      permittedSpender,
      11, // nonce
      0, // expiry
      true, // allowed
      v,
      r,
      s,
      {
        from: randomSender,
      }
    )
    assert.notEqual(await dai.allowance.call(holder, permittedSpender), 0)
  })
})
})
