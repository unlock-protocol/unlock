const { expect } = require('chai')
const { StandardMerkleTree } = require('@openzeppelin/merkle-tree')
const { ethers } = require('hardhat')
const { upgrades } = require('hardhat')
const { reverts } = require('../helpers')

describe.only('Airdrops Contract', function () {
  let owner, recipient
  let token, airdrops, upSwap

  const airdropTokens = ethers.parseEther('10000') // 10,000 tokens for airdrop
  const campaignName = 'Campaign1'
  const campaignHash = ethers.keccak256(ethers.toUtf8Bytes(campaignName))
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

  async function getSignature(recipient, signer) {
    const domain = {
      name: await airdrops.EIP712Name(),
      version: await airdrops.EIP712Version(),
      chainId: (await ethers.provider.getNetwork()).chainId, // Mainnet (Change for testnets)
      verifyingContract: await airdrops.getAddress(),
    }

    const types = {
      TosSignature: [
        { name: 'signer', type: 'address' },
        { name: 'campaignName', type: 'string' },
        { name: 'timestamp', type: 'uint256' },
      ],
    }

    const timestamp = new Date().getTime()
    const value = {
      signer: recipient.address,
      campaignName,
      timestamp,
    }

    // Signing Typed Data (EIP-712)
    return {
      timestamp,
      tosSignature: await signer.signTypedData(domain, types, value),
    }
  }

  beforeEach(async function () {
    ;[owner, recipient] = await ethers.getSigners()

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
      const tx = await airdrops.setMerkleRootForCampaign(campaignName, leaf)
      await tx.wait()

      // Retrieve the campaign details.
      const campaign = await airdrops.campaigns(campaignHash)
      expect(campaign.merkleRoot).to.equal(leaf)
      expect(campaign.name).to.equal(campaignName)
    })

    it('should revert if non-owner attempts to set campaign', async function () {
      const leaf = computeLeaf(recipient.address, claimAmount)
      await reverts(
        airdrops
          .connect(recipient)
          .setMerkleRootForCampaign(campaignHash, leaf),
        `OwnableUnauthorizedAccount("${recipient.address}")`
      )
    })
  })

  describe('Token Claim', function () {
    let tree
    beforeEach(async function () {
      // create a merkle tree with the recipient and claim amount
      tree = StandardMerkleTree.of(
        [[recipient.address, claimAmount.toString()]],
        ['address', 'uint256']
      )

      // Get the root
      const root = tree.root

      // Set the campaign with the proper Merkle root
      await airdrops.setMerkleRootForCampaign(campaignName, root)
    })

    it('should fail to claim if the signature for TOS is not valid', async function () {
      const [user, recipient] = await ethers.getSigners()
      // Check initial token balance.
      const initialBal = await token.balanceOf(recipient.address)
      let proof

      for (const [i, v] of tree.entries()) {
        if (v[0] === recipient.address) {
          proof = tree.getProof(i)
        }
      }

      const { tosSignature, timestamp } = await getSignature(recipient, user)

      // Execute the claim with the valid proof - use formatted proof
      await reverts(
        airdrops.claim(
          campaignName,
          timestamp,
          recipient.address,
          claimAmount,
          proof,
          tosSignature
        ),
        `WrongSigner("${campaignHash}", "${recipient.address}")`
      )
    })

    it('should claim tokens successfully with a valid proof', async function () {
      const [, recipient] = await ethers.getSigners()
      // Check initial token balance.
      const initialBal = await token.balanceOf(recipient.address)
      let proof

      for (const [i, v] of tree.entries()) {
        if (v[0] === recipient.address) {
          proof = tree.getProof(i)
        }
      }

      const { tosSignature, timestamp } = await getSignature(
        recipient,
        recipient
      )

      // Execute the claim with the valid proof - use formatted proof
      const tx = await airdrops.claim(
        campaignName,
        timestamp,
        recipient.address,
        claimAmount,
        proof,
        tosSignature
      )
      await tx.wait()

      // Verify that the recipient received the correct tokens.
      const finalBal = await token.balanceOf(recipient.address)
      expect(finalBal - initialBal).to.equal(claimAmount)
    })

    it('should revert claim with an invalid proof', async function () {
      // Provide an invalid Merkle proof.
      const invalidProof = [
        '0x1234567890123456789012345678901234567890123456789012345678901234',
      ]
      const { tosSignature, timestamp } = await getSignature(
        recipient,
        recipient
      )

      await reverts(
        airdrops.claim(
          campaignName,
          timestamp,
          recipient.address,
          claimAmount,
          invalidProof,
          tosSignature
        ),
        // `InvalidProof("${campaignHash}", "${recipient.address}", ${claimAmount}, ${invalidProof})`
        `InvalidProof("${campaignHash}", "${recipient.address}", ${claimAmount}, ${JSON.stringify(invalidProof)})`
      )
    })

    it('should revert claim for a blocklisted user', async function () {
      // Blocklist the recipient.
      await airdrops.addToBlocklist(recipient.address)

      let proof
      for (const [i, v] of tree.entries()) {
        if (v[0] === recipient.address) {
          proof = tree.getProof(i)
        }
      }

      const { tosSignature, timestamp } = await getSignature(
        recipient,
        recipient
      )

      // Use the valid proof
      await reverts(
        airdrops.claim(
          campaignName,
          timestamp,
          recipient.address,
          claimAmount,
          proof,
          tosSignature
        ),
        `UserBlocked("${recipient.address}")`
      )
    })
  })
})
