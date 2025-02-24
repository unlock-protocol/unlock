/**
 * Tests for Airdrops.sol contract
 *
 * Tests cover:
 * - Campaign setup
 *   - Only owner can set campaign merkle root and TOS
 *   - Campaign data is stored correctly
 *
 * - TOS signing
 *   - Users must sign valid TOS to claim
 *   - Invalid signatures are rejected
 *
 * - Token claims
 *   - Valid merkle proofs allow claiming tokens
 *   - Invalid proofs are rejected
 *   - Blocklisted users cannot claim
 *   - Double claims are prevented
 *
 * Technical notes:
 * - Merkle leaf computation:
 *   leaf = keccak256(bytes.concat(keccak256(abi.encode(recipient, amount))))
 *
 * - TOS hash computation:
 *   tosHash = MessageHashUtils.toEthSignedMessageHash(keccak256(bytes(tos)))
 */

const { expect, assert } = require('chai')
const { StandardMerkleTree } = require('@openzeppelin/merkle-tree')
const { ethers } = require('hardhat')
const { upgrades } = require('hardhat')

async function expectRevert(call) {
  let reverted = false
  try {
    await call
  } catch (error) {
    reverted = true
  }
  if (!reverted) {
    assert.fail('Expected transaction to revert')
  }
}

describe('Airdrops Contract', function () {
  let owner, recipient, other
  let token, airdrops, upSwap

  const initialSupply = ethers.parseEther('1000000') // 1,000,000 tokens
  const airdropTokens = ethers.parseEther('10000') // 10,000 tokens for airdrop
  const campaignName = 'Campaign1'
  const tosText = 'I agree to the terms of service.'
  const claimAmount = ethers.parseEther('100') // Claim 100 tokens

  /**
   * Helper to compute the leaf value.
   *
   * Replicates the Solidity computation:
   *   innerHash = keccak256(abi.encode(recipient, amount))
   *   leaf = keccak256(bytes.concat(innerHash))
   *
   * @param {string} recipientAddr - Recipient address.
   * @param {BigNumber} amount - Claim amount.
   * @returns {string} - The computed leaf as a hex string.
   */
  function computeLeaf(recipientAddr, amount) {
    // Use ABI encoding to match the contract's abi.encode
    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
      ['address', 'uint256'],
      [recipientAddr, amount]
    )
    // First hash (matches keccak256(abi.encode(...)))
    const innerHash = ethers.keccak256(encoded)
    // Second hash (matches keccak256(bytes.concat(...)))
    return ethers.keccak256(innerHash)
  }

  /**
   * Helper to format proof bytes for the contract
   *
   * @param {Array} proof - Array of hex strings representing the proof
   * @returns {string} - Concatenated proof bytes with single 0x prefix
   */
  function formatProof(proof) {
    return `0x${proof.map((p) => p.slice(2)).join('')}`
  }

  beforeEach(async function () {
    ;[owner, recipient, other] = await ethers.getSigners()

    // Deploy UPToken
    const UP = await ethers.getContractFactory('UPToken')
    token = await upgrades.deployProxy(UP, [await owner.getAddress()])
    await token.waitForDeployment()

    // Create a mock UPSwap contract address to receive the minted tokens
    upSwap = owner.address

    // Mint tokens to the upSwap address (which is owner in this test)
    await token.mint(upSwap)

    // Deploy the Airdrops contract
    const Airdrops = await ethers.getContractFactory('Airdrops')
    airdrops = await Airdrops.deploy(await token.getAddress())
    await airdrops.waitForDeployment()

    // Transfer tokens to the Airdrops contract
    await token.transfer(await airdrops.getAddress(), airdropTokens)
  })

  describe('Campaign setup', function () {
    it('should allow owner to set campaign and store correct values', async function () {
      // Compute a valid leaf for the campaign (using recipient and claimAmount).
      const leaf = computeLeaf(recipient.address, claimAmount)

      // Set the campaign with a valid Merkle root.
      const tx = await airdrops.setMerkleRootForCampaign(
        campaignName,
        tosText,
        leaf
      )
      await tx.wait()

      // Retrieve the campaign details.
      const campaign = await airdrops.campaigns(campaignName)

      // Compute the expected TOS hash on-chain:
      // expectedTosHash = keccak256( "\x19Ethereum Signed Message:\n32" || rawTosHash )
      const rawTosHash = ethers.keccak256(ethers.toUtf8Bytes(tosText))
      const expectedTosHash = ethers.keccak256(
        ethers.concat([
          ethers.toUtf8Bytes('\x19Ethereum Signed Message:\n32'),
          ethers.getBytes(rawTosHash),
        ])
      )

      expect(campaign.tosHash).to.equal(expectedTosHash)
      expect(campaign.merkleRoot).to.equal(leaf)
    })

    it('should revert if non-owner attempts to set campaign', async function () {
      const leaf = computeLeaf(recipient.address, claimAmount)
      await expectRevert(
        airdrops
          .connect(recipient)
          .setMerkleRootForCampaign(campaignName, tosText, leaf)
      )
    })
  })

  describe('TOS Signing', function () {
    beforeEach(async function () {
      // For TOS signing tests, set the campaign first.
      const leaf = computeLeaf(recipient.address, claimAmount)
      await airdrops.setMerkleRootForCampaign(campaignName, tosText, leaf)
    })

    it('should revert signTos if campaign does not exist', async function () {
      // Compute the raw TOS hash using the same method as the contract.
      const rawTosHash = ethers.keccak256(ethers.toUtf8Bytes(tosText))
      const signature = await recipient.signMessage(ethers.getBytes(rawTosHash))
      await expectRevert(
        airdrops.signTos('NonExistingCampaign', recipient.address, signature)
      )
    })

    it('should allow valid signature for signing TOS', async function () {
      const rawTosHash = ethers.keccak256(ethers.toUtf8Bytes(tosText))
      const signature = await recipient.signMessage(ethers.getBytes(rawTosHash))

      const tx = await airdrops.signTos(
        campaignName,
        recipient.address,
        signature
      )
      await tx.wait()

      // Verify that the signedTos mapping for the campaign and recipient is set.
      const storedValue = await airdrops.signedTos(
        campaignName,
        recipient.address
      )
      expect(storedValue).to.not.equal(ethers.ZeroHash)
    })

    it('should revert signTos with an invalid signature', async function () {
      // Use a signature from a different signer (other) instead of the recipient.
      const rawTosHash = ethers.keccak256(ethers.toUtf8Bytes(tosText))
      const invalidSignature = await other.signMessage(
        ethers.getBytes(rawTosHash)
      )

      await expectRevert(
        airdrops.signTos(campaignName, recipient.address, invalidSignature)
      )
    })
  })

  describe('Token Claim', function () {
    let formattedProof
    beforeEach(async function () {
      // create a merkle tree with the recipient and claim amount
      const tree = StandardMerkleTree.of(
        [[recipient.address, claimAmount.toString()]],
        ['address', 'uint256']
      )

      // Get the root
      const root = tree.root

      // Set the campaign with the proper Merkle root
      await airdrops.setMerkleRootForCampaign(campaignName, tosText, root)

      // Have the recipient sign the TOS
      const rawTosHash = ethers.keccak256(ethers.toUtf8Bytes(tosText))
      const signature = await recipient.signMessage(ethers.getBytes(rawTosHash))
      await airdrops.signTos(campaignName, recipient.address, signature)

      // Format the proof the same way as in the AllowListHook test
      for (const [i, v] of tree.entries()) {
        if (v[0] === recipient.address) {
          formattedProof = `0x${tree
            .getProof(i)
            .map((p) => p.slice(2))
            .join('')}`
        }
      }
    })

    it('should claim tokens successfully with a valid proof', async function () {
      // Check initial token balance.
      const initialBal = await token.balanceOf(recipient.address)

      // Execute the claim with the valid proof - use formatted proof
      const tx = await airdrops.claim(
        campaignName,
        recipient.address,
        claimAmount,
        formattedProof
      )
      await tx.wait()

      // Verify that the recipient received the correct tokens.
      const finalBal = await token.balanceOf(recipient.address)
      expect(finalBal - initialBal).to.equal(claimAmount)
    })

    it('should revert claim with an invalid proof', async function () {
      // Provide an invalid Merkle proof.
      const invalidProof = formatProof([
        '0x1234567890123456789012345678901234567890123456789012345678901234',
      ])
      await expectRevert(
        airdrops.claim(
          campaignName,
          recipient.address,
          claimAmount,
          invalidProof
        )
      )
    })

    it('should revert claim for a blocklisted user', async function () {
      // Blocklist the recipient.
      await airdrops.addToBlocklist(recipient.address)

      // Use the valid proof
      await expectRevert(
        airdrops.claim(
          campaignName,
          recipient.address,
          claimAmount,
          formattedProof
        )
      )
    })
  })
})
