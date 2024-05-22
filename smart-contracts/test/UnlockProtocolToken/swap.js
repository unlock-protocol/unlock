const { assert } = require('chai')
const { ethers, upgrades } = require('hardhat')
const { reverts } = require('../helpers')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')

const amount = ethers.parseEther('10')

const parseLogs = (logs, interface) =>
  logs.map((log) => {
    const parsed = interface.parseLog(log)
    return parsed ? parsed : log
  })

describe('UPSwap / swap UDT for UP', () => {
  let owner, preMinter, sender, recipient, random
  let up, udt, swap

  before(async () => {
    ;[owner, preMinter, sender, recipient, random] = await ethers.getSigners()

    const UDT = await ethers.getContractFactory('UnlockDiscountTokenV3')
    udt = await upgrades.deployProxy(UDT, [await preMinter.getAddress()], {
      initializer: 'initialize(address)',
    })

    const UP = await ethers.getContractFactory('UnlockProtocolToken')
    up = await upgrades.deployProxy(UP, [
      await owner.getAddress(),
      await preMinter.getAddress(),
    ])

    const UPSwap = await ethers.getContractFactory('UPSwap')
    swap = await upgrades.deployProxy(UPSwap, [
      await up.getAddress(),
      await udt.getAddress(),
      await owner.getAddress(),
    ])

    // transfer entire UP supply to swap contract
    await up
      .connect(preMinter)
      .transfer(await swap.getAddress(), await up.totalSupply())
  })

  describe('settings', () => {
    it('udt is properly set', async () => {
      assert.equal(await swap.up(), await up.getAddress())
    })
    it('up is properly set', async () => {
      assert.equal(await swap.udt(), await udt.getAddress())
    })
  })
  describe('ownership', () => {
    it('is properly set', async () => {
      assert.equal(await owner.getAddress(), await swap.owner())
    })
  })

  describe('swapUDTForUP', () => {
    describe('reverts', () => {
      it('when balance is too low', async () => {
        await reverts(
          swap.swapUDTForUP(
            await sender.getAddress(),
            amount,
            await recipient.getAddress()
          ),
          'BalanceTooLow'
        )
      })
      it('when allowance is not properly set', async () => {
        await udt.connect(preMinter).mint(await sender.getAddress(), amount)
        await reverts(
          swap.swapUDTForUP(
            await sender.getAddress(),
            amount,
            await recipient.getAddress()
          ),
          'AllowanceTooLow'
        )
      })
    })
    describe('swap', () => {
      let receipt, parsedLogs
      let senderBalanceBefore
      let swapBalanceBefore

      before(async () => {
        // prepare funds and allowance
        await udt.connect(preMinter).mint(await sender.getAddress(), amount)
        await udt.connect(sender).approve(await swap.getAddress(), amount)

        // get balances
        senderBalanceBefore = await udt.balanceOf(await sender.getAddress())
        swapBalanceBefore = await udt.balanceOf(await swap.getAddress())

        // do the swap
        const tx = await swap.swapUDTForUP(
          await sender.getAddress(),
          amount,
          await recipient.getAddress()
        )

        // parse receipt
        receipt = await tx.wait()
        parsedLogs = parseLogs(receipt.logs, udt.interface)
      })

      it('UP has been sent to recipient', async () => {
        assert.equal(await up.balanceOf(await recipient.getAddress()), amount)
      })
      it('UDT has been transferred to swap contract', async () => {
        assert.equal(
          await udt.balanceOf(await swap.getAddress()),
          swapBalanceBefore + amount
        )
        assert.equal(
          await udt.balanceOf(await sender.getAddress()),
          senderBalanceBefore - amount
        )
      })

      it('allowance is reset', async () => {
        assert.equal(
          await udt.allowance(
            await sender.getAddress(),
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
        assert.equal(approvalArgs[0], await sender.getAddress())
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
        const { args } = await getEvent(receipt, 'UDTSwapped')
        assert.equal(await sender.getAddress(), args.sender)
        assert.equal(await recipient.getAddress(), args.recipient)
        assert.equal(amount, args.amount)
      })
    })
  })

  describe('swapUPforUDT', () => {
    before(async () => {
      // before all, get sender some UP token
      await udt.connect(preMinter).mint(await sender.getAddress(), amount)
      await udt.connect(sender).approve(await swap.getAddress(), amount)
      // swap to itself
      await swap.swapUDTForUP(
        await sender.getAddress(),
        amount,
        await sender.getAddress()
      )
    })
    describe('reverts', () => {
      it('when balance is too low', async () => {
        await reverts(
          swap.swapUPforUDT(
            await random.getAddress(),
            amount,
            await recipient.getAddress()
          ),
          'BalanceTooLow'
        )
      })
      it('when allowance is not properly set', async () => {
        await reverts(
          swap.swapUPforUDT(
            await sender.getAddress(),
            amount,
            await recipient.getAddress()
          ),
          'AllowanceTooLow'
        )
      })
    })

    describe('swap', () => {
      let receipt, parsedLogs
      let senderBalanceBefore
      let swapBalanceBefore

      before(async () => {
        // prepare allowance
        await up.connect(sender).approve(await swap.getAddress(), amount)

        // get balances
        senderBalanceBefore = await up.balanceOf(await sender.getAddress())
        swapBalanceBefore = await up.balanceOf(await swap.getAddress())

        // do the swap
        const tx = await swap.swapUPforUDT(
          await sender.getAddress(),
          amount,
          await recipient.getAddress()
        )

        // parse receipt
        receipt = await tx.wait()
        parsedLogs = parseLogs(receipt.logs, up.interface)
      })

      it('UDT has been sent to recipient', async () => {
        assert.equal(await udt.balanceOf(await recipient.getAddress()), amount)
      })
      it('UP has been transferred to contract', async () => {
        assert.equal(
          await up.balanceOf(await swap.getAddress()),
          swapBalanceBefore + amount
        )
        assert.equal(
          await up.balanceOf(await sender.getAddress()),
          senderBalanceBefore - amount
        )
      })

      it('allowance is reset', async () => {
        assert.equal(
          await up.allowance(
            await sender.getAddress(),
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
        const { args } = await getEvent(receipt, 'UPSwapped')
        assert.equal(await sender.getAddress(), args.sender)
        assert.equal(await recipient.getAddress(), args.recipient)
        assert.equal(amount, args.amount)
      })
    })
  })
})
