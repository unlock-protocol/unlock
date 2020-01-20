const helpers = require('hardlydifficult-ethereum-contracts')

function fixSignature(signature) {
  // in geth its always 27/28, in ganache its 0/1. Change to 27/28 to prevent
  // signature malleability if version is 0/1
  // see https://github.com/ethereum/go-ethereum/blob/v1.8.23/internal/ethapi/api.go#L465
  let v = parseInt(signature.slice(130, 132), 16)
  if (v < 27) {
    v += 27
  }
  const vHex = v.toString(16)
  return signature.slice(0, 130) + vHex
}

// signs message in node (ganache auto-applies "Ethereum Signed Message" prefix)
async function signMessage(messageHex, signer) {
  const signature = fixSignature(await web3.eth.sign(messageHex, signer))
  const v = `0x${signature.slice(130, 132)}`
  const r = signature.slice(0, 66)
  const s = `0x${signature.slice(66, 130)}`
  return { v, r, s }
}

contract('test-artifacts / dai', accounts => {
  const protocolOwner = accounts[0]
  const holder = accounts[9]
  const approvedSpender = accounts[5]
  const permittedSpender = accounts[7]
  const randomSender = accounts[6]
  const PERMIT_TYPEHASH = 0xea2aa0a1be11a07ed86d755c93467f4f82362b452371d1ba94d1715123511acb
  let dai
  let messageHex

  before(async () => {
    dai = await helpers.tokens.dai.deploy(web3, protocolOwner)
    await dai.mint(holder, '1000', {
      from: protocolOwner,
    })
    // 0xedee806a8ab23b82c8758911d01ead1fd69d02fdb5ce118fa7317047917131c5
    const DOMAIN_SEPARATOR = await dai.DOMAIN_SEPARATOR.call()
    //
    messageHex = web3.utils.keccak256(
      '\x19\x01',
      `${DOMAIN_SEPARATOR}`,
      web3.utils.keccak256(
        `${PERMIT_TYPEHASH}`,
        holder,
        permittedSpender,
        11,
        0,
        true
      )
    )
    console.log(`messageHex: ${messageHex}`)
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
    const signature = await signMessage(messageHex, holder)
    assert.equal(await dai.balanceOf.call(holder), 1000)
    assert.equal(await dai.allowance.call(holder, permittedSpender), 0)
    /**
     * permit(address holder, address spender, uint256 nonce, uint256 expiry,
                    bool allowed, uint8 v, bytes32 r, bytes32 s)
     */
    await dai.permit(
      holder,
      permittedSpender,
      11, // nonce
      0, // expiry
      true, // allowed
      signature.v,
      signature.r,
      signature.s,
      {
        from: randomSender,
      }
    )
    assert.notEqual(await dai.allowance.call(holder, permittedSpender), 0)
  })
})
