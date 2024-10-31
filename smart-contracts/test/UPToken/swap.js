const { assert } = require('chai')
const { ethers, upgrades } = require('hardhat')
const { reverts, deployERC20, parseLogs } = require('../helpers')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

const amountUDT = ethers.parseEther('1')
const amountUP = ethers.parseEther('1000')

describe('Swapper UP / UDT', () => {
  let owner, udtMinter, spender, recipient, random
  let up, udt, swap

  before(async () => {
    ;[owner, udtMinter, spender, recipient, random] = await ethers.getSigners()

    const UDT = await ethers.getContractFactory('UnlockDiscountTokenV3')
    udt = await upgrades.deployProxy(UDT, [await udtMinter.getAddress()], {
      initializer: 'initialize(address)',
    })

    const UP = await ethers.getContractFactory('UPToken')
    up = await upgrades.deployProxy(UP, [await owner.getAddress()])

    const UPSwap = await ethers.getContractFactory('UPSwap')
    swap = await upgrades.deployProxy(UPSwap, [
      await udt.getAddress(),
      await up.getAddress(),
      await owner.getAddress(),
    ])

    // mint the entire supply to swap
    await up.mint(await swap.getAddress())
  })

  describe('initialization', () => {
    it('reverts if tries to set UP token address twice', async () => {
      reverts(swap.setUp(await up.getAddress()), 'UpAlreadySet')
    })
    it('owns entire supply of UP', async () => {
      assert.equal(
        await up.balanceOf(await swap.getAddress()),
        (await up.TOTAL_SUPPLY()) * 10n ** (await up.decimals())
      )
    })
    it('udt is properly set', async () => {
      assert.equal(await swap.up(), await up.getAddress())
    })
    it('up is properly set', async () => {
      assert.equal(await swap.udt(), await udt.getAddress())
    })
  })

  describe('contract ownership', () => {
    it('is properly set', async () => {
      assert.equal(await owner.getAddress(), await swap.owner())
    })
  })

  describe('swapUDTForUP', () => {
    describe('reverts', () => {
      it('when UDT balance is too low', async () => {
        await reverts(
          swap
            .connect(spender)
            .swapUDTForUP(amountUDT, await recipient.getAddress()),
          `ERC20: transfer amount exceeds balance`
        )
      })
      it('when UDT allowance is not properly set', async () => {
        await udt.connect(udtMinter).mint(await spender.getAddress(), amountUDT)
        await reverts(
          swap
            .connect(spender)
            .swapUDTForUP(amountUDT, await recipient.getAddress()),
          'ERC20: transfer amount exceeds allowance'
        )
      })
    })
    describe('swap', () => {
      let receipt, parsedLogs
      let spenderBalanceBefore
      let swapBalanceBefore

      before(async () => {
        // prepare funds and allowance
        await udt.connect(udtMinter).mint(await spender.getAddress(), amountUDT)
        await udt.connect(spender).approve(await swap.getAddress(), amountUDT)

        // get balances
        spenderBalanceBefore = await udt.balanceOf(await spender.getAddress())
        swapBalanceBefore = await udt.balanceOf(await swap.getAddress())

        // do the swap
        const tx = await swap
          .connect(spender)
          .swapUDTForUP(amountUDT, await recipient.getAddress())

        // parse receipt
        receipt = await tx.wait()
        parsedLogs = parseLogs(receipt.logs, udt.interface)
      })

      it('UP has been sent to recipient', async () => {
        assert.equal(await up.balanceOf(await recipient.getAddress()), amountUP)
      })
      it('UDT has been transferred to swap contract', async () => {
        assert.equal(
          await udt.balanceOf(await swap.getAddress()),
          swapBalanceBefore + amountUDT
        )
        assert.equal(
          await udt.balanceOf(await spender.getAddress()),
          spenderBalanceBefore - amountUDT
        )
      })

      it('allowance is reset', async () => {
        assert.equal(
          await udt.allowance(
            await spender.getAddress(),
            await swap.getAddress()
          ),
          0n
        )

        // approval reset event has been fired
        const approvals = parsedLogs.filter(
          ({ fragment }) => fragment.name === 'Approval'
        )
        assert.equal(approvals.length, 1)
        const [{ args: approvalArgs }] = approvals
        assert.equal(approvalArgs[0], await spender.getAddress())
        assert.equal(approvalArgs[1], await swap.getAddress())
        assert.equal(approvalArgs[2], 0n)
      })
      it('fired Transfer events', async () => {
        const transfers = parsedLogs.filter(
          ({ fragment }) => fragment.name === 'Transfer'
        )
        assert.equal(transfers.length, 2)
      })
      it('fired custom event', async () => {
        const { args } = await getEvent(receipt, 'UDTSwappedForUP')
        assert.equal(await spender.getAddress(), args.spender)
        assert.equal(await recipient.getAddress(), args.recipient)
        assert.equal(amountUDT, args.amountUDT)
        assert.equal(amountUP, args.amountUP)
      })
    })
  })

  describe('swapUPForUDT', () => {
    describe('reverts', () => {
      it('when UP allowance is not properly set', async () => {
        await reverts(
          swap
            .connect(spender)
            .swapUPForUDT(amountUP, await recipient.getAddress()),
          `ERC20InsufficientAllowance("${await swap.getAddress()}", 0, ${amountUP.toString()})`
        )
      })
      it('when spender UP balance is too low', async () => {
        await up.connect(random).approve(await swap.getAddress(), amountUP)
        await reverts(
          swap
            .connect(random)
            .swapUPForUDT(amountUP, await recipient.getAddress()),
          `ERC20InsufficientBalance("${await random.getAddress()}", 0, ${amountUP.toString()})`
        )
      })
    })

    describe('swap', () => {
      let receipt, parsedLogs
      let spenderBalanceBefore
      let swapBalanceBefore

      before(async () => {
        // before all, get spender some UP tokens
        await udt.connect(udtMinter).mint(await spender.getAddress(), amountUDT)
        await udt.connect(spender).approve(await swap.getAddress(), amountUDT)

        // spender swap UDT for UP
        await swap
          .connect(spender)
          .swapUDTForUP(amountUDT, await spender.getAddress())
        assert.equal(await up.balanceOf(await spender.getAddress()), amountUP)

        // prepare allowance
        await up.connect(spender).approve(await swap.getAddress(), amountUP)

        // get balances
        spenderBalanceBefore = await up.balanceOf(await spender.getAddress())
        swapBalanceBefore = await up.balanceOf(await swap.getAddress())

        // do the swap
        const tx = await swap
          .connect(spender)
          .swapUPForUDT(amountUP, await recipient.getAddress())

        // parse receipt
        receipt = await tx.wait()
        parsedLogs = parseLogs(receipt.logs, up.interface)
      })

      it('UDT has been sent to recipient', async () => {
        assert.equal(
          await udt.balanceOf(await recipient.getAddress()),
          amountUDT
        )
      })
      it('UP has been transferred from spender to contract', async () => {
        assert.equal(
          await up.balanceOf(await swap.getAddress()),
          swapBalanceBefore + amountUP
        )
        assert.equal(
          await up.balanceOf(await spender.getAddress()),
          spenderBalanceBefore - amountUP
        )
      })

      it('allowance is reset', async () => {
        assert.equal(
          await up.allowance(
            await spender.getAddress(),
            await swap.getAddress()
          ),
          0n
        )

        // approval reset event has NOT been fired (udt contract)
        const approvals = parsedLogs.filter(
          ({ fragment }) => fragment.name === 'Approval'
        )
        assert.equal(approvals.length, 0)
      })
      it('fired Transfer events', async () => {
        const transfers = parsedLogs.filter(
          ({ fragment }) => fragment.name === 'Transfer'
        )
        assert.equal(transfers.length, 2)
      })
      it('fired custom event', async () => {
        const { args } = await getEvent(receipt, 'UPSwappedForUDT')
        assert.equal(await spender.getAddress(), args.spender)
        assert.equal(await recipient.getAddress(), args.recipient)
        assert.equal(amountUDT, args.amountUDT)
        assert.equal(amountUP, args.amountUP)
      })
    })
  })
  describe('setUp', () => {
    it('update the address of the UP token', async () => {
      const erc20 = await deployERC20(await owner.getAddress())
      await swap.setUp(await erc20.getAddress())
      assert.equal(await swap.up(), await erc20.getAddress())
    })
    it('can be called only by owner', async () => {
      const [, attacker] = await ethers.getSigners()
      await reverts(
        swap.connect(attacker).setUp(await attacker.getAddress()),
        `OwnableUnauthorizedAccount("${await attacker.getAddress()}")`
      )
    })
  })
})
