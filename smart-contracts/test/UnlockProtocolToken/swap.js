const { assert } = require('chai')
const { ethers, upgrades } = require('hardhat')
const { reverts } = require('../helpers')
const { getEvent } = require('@unlock-protocol/hardhat-helpers')
const {
  abi: permit2Abi,
  bytecode: permit2Bytecode,
} = require('@unlock-protocol/hardhat-helpers/dist/ABIs/permit2.json')

const amountUDT = ethers.parseEther('1')
const amountUP = ethers.parseEther('1000')

const parseLogs = (logs, interface) =>
  logs.map((log) => {
    const parsed = interface.parseLog(log)
    return parsed ? parsed : log
  })

const toDeadline = async (expiration) => {
  const { timestamp } = await ethers.provider.getBlock()
  return timestamp + expiration
}

const PERMIT_DETAILS = [
  { name: 'token', type: 'address' },
  { name: 'amount', type: 'uint160' },
  { name: 'expiration', type: 'uint48' },
  { name: 'nonce', type: 'uint48' },
]

const PERMIT_TYPES = {
  PermitSingle: [
    { name: 'details', type: 'PermitDetails' },
    { name: 'spender', type: 'address' },
    { name: 'sigDeadline', type: 'uint256' },
  ],
  PermitDetails: PERMIT_DETAILS,
}

describe('UPSwap / swap UDT for UP', () => {
  let owner, preMinter, spender, recipient, random
  let up, udt, swap, permit2

  before(async () => {
    ;[owner, preMinter, spender, recipient, random] = await ethers.getSigners()

    const UDT = await ethers.getContractFactory('UnlockDiscountTokenV3')
    udt = await upgrades.deployProxy(UDT, [await preMinter.getAddress()], {
      initializer: 'initialize(address)',
    })

    const UP = await ethers.getContractFactory('UnlockProtocolToken')
    up = await upgrades.deployProxy(UP, [
      await owner.getAddress(),
      await preMinter.getAddress(),
    ])

    const Permit2 = await ethers.getContractFactory(permit2Abi, permit2Bytecode)
    permit2 = await Permit2.deploy()

    const UPSwap = await ethers.getContractFactory('UPSwap')
    swap = await upgrades.deployProxy(UPSwap, [
      await up.getAddress(),
      await udt.getAddress(),
      await permit2.getAddress(),
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

  describe('contract ownership', () => {
    it('is properly set', async () => {
      assert.equal(await owner.getAddress(), await swap.owner())
    })
  })

  describe('swapUDTForUP', () => {
    describe('reverts', () => {
      it('when UDT balance is too low', async () => {
        await reverts(
          swap.swapUDTForUP(
            await spender.getAddress(),
            amountUDT,
            await recipient.getAddress()
          ),
          `BalanceTooLow("${await udt.getAddress()}", "${await spender.getAddress()}", ${amountUDT.toString()})`
        )
      })
      it('when UDT allowance is not properly set', async () => {
        await udt.connect(preMinter).mint(await spender.getAddress(), amountUDT)
        await reverts(
          swap.swapUDTForUP(
            await spender.getAddress(),
            amountUDT,
            await recipient.getAddress()
          ),
          'AllowanceTooLow'
        )
      })
    })
    describe('swap', () => {
      let receipt, parsedLogs
      let spenderBalanceBefore
      let swapBalanceBefore

      before(async () => {
        // prepare funds and allowance
        await udt.connect(preMinter).mint(await spender.getAddress(), amountUDT)
        await udt.connect(spender).approve(await swap.getAddress(), amountUDT)

        // get balances
        spenderBalanceBefore = await udt.balanceOf(await spender.getAddress())
        swapBalanceBefore = await udt.balanceOf(await swap.getAddress())

        // do the swap
        const tx = await swap.swapUDTForUP(
          await spender.getAddress(),
          amountUDT,
          await recipient.getAddress()
        )

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
        const { args } = await getEvent(receipt, 'UDTSwapped')
        assert.equal(await spender.getAddress(), args.spender)
        assert.equal(await recipient.getAddress(), args.recipient)
        assert.equal(amountUDT, args.amountUDT)
        assert.equal(amountUP, args.amountUP)
      })
    })
  })

  describe('swapUPForUDT', () => {
    before(async () => {
      // before all, get spender some UP tokens
      await udt.connect(preMinter).mint(await spender.getAddress(), amountUDT)
      await udt.connect(spender).approve(await swap.getAddress(), amountUDT)
      // spender swap UDT for UP
      await swap.swapUDTForUP(
        await spender.getAddress(),
        amountUDT,
        await spender.getAddress()
      )
      assert.equal(await up.balanceOf(await spender.getAddress()), amountUP)
    })

    describe('reverts', () => {
      it('when spender UP balance is too low', async () => {
        await reverts(
          swap.swapUPForUDT(
            await random.getAddress(),
            amountUP,
            await recipient.getAddress()
          ),
          `BalanceTooLow("${await up.getAddress()}", "${await random.getAddress()}", ${amountUP.toString()})`
        )
      })
      it('when UP allowance is not properly set', async () => {
        await reverts(
          swap.swapUPForUDT(
            await spender.getAddress(),
            amountUP,
            await recipient.getAddress()
          ),
          'AllowanceTooLow'
        )
      })
    })

    describe('swap', () => {
      let receipt, parsedLogs
      let spenderBalanceBefore
      let swapBalanceBefore

      before(async () => {
        // prepare allowance
        await up.connect(spender).approve(await swap.getAddress(), amountUP)

        // get balances
        spenderBalanceBefore = await up.balanceOf(await spender.getAddress())
        swapBalanceBefore = await up.balanceOf(await swap.getAddress())

        // do the swap
        const tx = await swap.swapUPForUDT(
          await spender.getAddress(),
          amountUP,
          await recipient.getAddress()
        )

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
        const { args } = await getEvent(receipt, 'UPSwapped')
        assert.equal(await spender.getAddress(), args.spender)
        assert.equal(await recipient.getAddress(), args.recipient)
        assert.equal(amountUDT, args.amountUDT)
        assert.equal(amountUP, args.amountUP)
      })
    })
  })

  describe('swapUPForUDTWithSignature', () => {
    let receipt, parsedLogs
    let spenderBalanceBefore, recipientBalanceBefore, swapBalanceBefore

    before(async () => {
      // before all, get spender some UP tokens
      await udt.connect(preMinter).mint(await spender.getAddress(), amountUDT)
      await udt.connect(spender).approve(await swap.getAddress(), amountUDT)

      // spender swap UDT for UP
      await swap.swapUDTForUP(
        await spender.getAddress(),
        amountUDT,
        await spender.getAddress()
      )
      assert.equal(await up.balanceOf(await spender.getAddress()), amountUP)

      // get balances
      spenderBalanceBefore = await up.balanceOf(await spender.getAddress())
      swapBalanceBefore = await up.balanceOf(await swap.getAddress())
      recipientBalanceBefore = await udt.balanceOf(await recipient.getAddress())

      // approve permit2 to spend UP
      await up.connect(spender).approve(await permit2.getAddress(), amountUP)

      // parse permit
      const permitSingle = {
        details: {
          token: await up.getAddress(),
          amount: amountUP,
          expiration: await toDeadline(/* 30 days= */ 60 * 60 * 24 * 30),
          nonce: 0n,
        },
        spender: await swap.getAddress(),
        sigDeadline: await toDeadline(/* 30 minutes= */ 60 * 60 * 30),
      }

      const domain = {
        name: 'Permit2',
        chainId: 31337,
        verifyingContract: await permit2.getAddress(),
      }

      const signature = await spender.signTypedData(
        domain,
        PERMIT_TYPES,
        permitSingle
      )

      // actual swap
      const tx = await swap
        .connect(spender)
        .swapUPForUDTWithSignature(
          await spender.getAddress(),
          amountUP,
          await recipient.getAddress(),
          permitSingle,
          signature
        )
      // parse receipt
      receipt = await tx.wait()
      parsedLogs = parseLogs(receipt.logs, up.interface)
      console.log(parsedLogs)
    })
    describe('swap', () => {
      it('UDT has been sent to recipient', async () => {
        assert.equal(
          await udt.balanceOf(await recipient.getAddress()),
          recipientBalanceBefore + amountUDT
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

      it('fired Transfer events', async () => {
        console.log(parsedLogs)
        const transfers = parsedLogs.filter(
          (evt) => evt.fragment && evt.fragment.name === 'Transfer'
        )
        assert.equal(transfers.length, 2)
      })
      it('fired custom event', async () => {
        const { args } = await getEvent(receipt, 'UPSwapped')
        assert.equal(await spender.getAddress(), args.spender)
        assert.equal(await recipient.getAddress(), args.recipient)
        assert.equal(amountUDT, args.amountUDT)
        assert.equal(amountUP, args.amountUP)
      })
    })
  })
})
