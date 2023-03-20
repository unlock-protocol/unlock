// testing Bridge using a MockBridge contract
const { assert } = require("chai");
const { ethers } = require("hardhat");

const {
  deployContracts,
  reverts,
  ADDRESS_ZERO,
  deployBridge,
  getProxyAdmin,
} = require("../helpers");

let bridge,
  owner,
  dispatcher,
  manager,
  dao,
  unlockDest,
  keyOwner,
  wethDest,
  proxyAdmin

//
const destChainId = 31337;
const destDomainId = 1734439522;

const gasEstimate = 16000;
const url = `http://locksmith:8080/api/key/`;

contract("Unlock / bridged governance", () => {
  before(async () => {
    
    ;[owner, keyOwner, dao] = await ethers.getSigners()

    // mock bridge
    ;({bridge, wethDest} = await deployBridge())

    // deploy and set Unlock on a remote chain
    ;({ unlockEthers: unlockDest } = await deployContracts());
    await unlockDest.configUnlock(
      ADDRESS_ZERO, // udt
      wethDest.address, // wrappedEth
      gasEstimate,
      "DEST_KEY",
      url,
      destChainId
    );

    // deploy dispatcher to current chain (our mainnet)
    const GovDispatcher = await ethers.getContractFactory("GovDispatcher");
    dispatcher = await GovDispatcher.deploy(
      dao.address,
      bridge.address
    );

    // deploy unlock manager on remote chain
    const UnlockManager = await ethers.getContractFactory("UnlockManager");
    manager = await UnlockManager.deploy(
      bridge.address,
      dispatcher.address,
      unlockDest.address,
      destDomainId,
    );
    
    // transfer Unlock ProxyAdmin ownership to UnlockManager
    proxyAdmin = await getProxyAdmin(unlockDest.address)
    await proxyAdmin.transferOwnership(manager.address)
  });

  describe("manager", () => {
    it("stores bridger address", async () => {
      assert.equal(bridge.address, await manager.bridgeAddress());
    });
    it("stores Unlock address properly", async () => {
      assert.equal(
        await manager.unlockAddress(),
        unlockDest.address
      );
    });
    it("stores the domain properly", async () => {
      assert.equal(await manager.domain(), destDomainId);
    });
  })

  describe("dispatcher", () => {
    
    it("stores bridger sender", async () => {
      assert.equal(bridge.address, await dispatcher.bridgeAddress());
    });

    it("stores DAO address", async () => {
      assert.equal(dao.address, await dispatcher.daoAddress());
    });

    it("has an owner", async () => {
      assert.equal(owner.address, await dispatcher.owner());
    })

    describe('setManagers', () => {
      beforeEach(async () => {
        // set manager(s) in dispatcher
        await dispatcher.setManagers(
          [manager.address],
          [destChainId],
          [destDomainId],
        )
      })
      it("stores UnlockManager address properly", async () => {
        assert.equal(
          await dispatcher.unlockManagers(destDomainId),
          manager.address
        );
      });
      it("stores the domains properly", async () => {
        assert.equal(await dispatcher.domains(destChainId), destDomainId);
      });
      it("can be called only by owner", async () => {
        await reverts(
          dispatcher.connect(keyOwner).setManagers(
            [manager.address],
            [destChainId],
            [destDomainId],
          ),
          'Ownable'
        )
      })    
    })
  });

  describe("Unlock / setUnlockManager", () => {
    it("default to zero", async () => {
      assert.equal(await unlockDest.unlockManager(), ADDRESS_ZERO);
    })
    it("sets unlock manager address correctly", async () => {
      await unlockDest.setUnlockManager(manager.address)
      assert.equal(await unlockDest.unlockManager(), manager.address);
    });
    it("only unlock owner can call", async () => {
      reverts(
        unlockDest
          .connect(keyOwner)
          .setUnlockManager(manager.address),
        "ONLY_OWNER"
      );
    });
  });

  describe("make changes accross the bridge", () => {

    it('reverts is dispatcher is not called by the DAO', async () => {
      await reverts(
        dispatcher.dispatch(
          [destChainId],
          ['0x']
        ),
        'Unauthorized'
      )
    })

    it('can add new template to Unlock', async () => {
      // depoloy template
      const PublicLock = await ethers.getContractFactory('TestPublicLockUpgraded')
      const template = await PublicLock.deploy()
      const args = [
        template.address,
        14
      ]

      // parse call
      const { interface } = unlockDest
      const unlockCallData =  interface.encodeFunctionData('addLockTemplate', args)
      const calldata = ethers.utils.defaultAbiCoder.encode(['uint8', 'bytes' ], [1, unlockCallData])

      // make sure settings were ok before
      assert.equal(await unlockDest.publicLockImpls(args[1]), ADDRESS_ZERO);
      assert.equal(await unlockDest.publicLockVersions(args[0]), 0);

      // send through the dispatcher
      await dispatcher.connect(dao).dispatch(
        [destChainId],
        [calldata]
      )

      // make sure things have worked correctly
      assert.equal(await unlockDest.publicLockVersions(args[0]), args[1]);
      assert.equal(await unlockDest.publicLockImpls(args[1]), args[0]);
    })

    it('can upgrade Unlock from the bridge', async () => {
      const UnlockUpgraded = await ethers.getContractFactory('TestUnlockUpgraded')
      const unlockUpgraded = await UnlockUpgraded.deploy()

      const { interface } = proxyAdmin
      const args = [unlockDest.address, unlockUpgraded.address]
      const proxyAdminCalldata = interface.encodeFunctionData('upgrade', args)
      const calldata = ethers.utils.defaultAbiCoder.encode(['uint8', 'bytes' ], [2, proxyAdminCalldata])

      // send through the dispatcher
      await dispatcher.connect(dao).dispatch(
        [destChainId],
        [calldata]
      )

      const unlockAfterUpgrade = await ethers.getContractAt('TestUnlockUpgraded', unlockDest.address)
      assert.equal(await unlockAfterUpgrade.sayHello(), 'hello world')
    })
  })

});
