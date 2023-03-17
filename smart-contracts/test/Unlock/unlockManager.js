// testing Bridge using a MockBridge contract
const { assert } = require("chai");
const { ethers } = require("hardhat");

const {
  deployContracts,
  reverts,
  ADDRESS_ZERO,
  addSomeETH,
  deployERC20,
  deployWETH,
} = require("../helpers");

const { abi : proxyAdminAbi } = require('../helpers/ABIs/ProxyAdmin.json')

let managerDest,
  managerSrc,
  connext,
  erc20Src,
  erc20Dest,
  unlockSrc,
  unlockDest,
  unlockOwner,
  keyOwner,
  wethSrc,
  wethDest;

//
const srcChainId = 4;
const destChainId = 31337;
const srcDomainId = 1735353714;
const destDomainId = 1734439522;

const gasEstimate = 16000;
const url = `http://locksmith:8080/api/key/`;

contract("Unlock / bridged governance", () => {
  before(async () => {
    [unlockOwner, keyOwner] = await ethers.getSigners();

    // deploy weth & a token
    wethSrc = await deployWETH(unlockOwner);
    wethDest = await deployWETH(unlockOwner);

    // ERC20s on each chain
    erc20Src = await deployERC20(unlockOwner, true);
    erc20Dest = await deployERC20(unlockOwner, true);

    // connext
    const MockConnext = await ethers.getContractFactory("TestBridge");
    connext = await MockConnext.deploy(
      wethSrc.address,
      wethDest.address,
      srcDomainId,
      // both token mentioned for the swap
      erc20Src.address,
      erc20Dest.address
    );

    // fund the bridge
    await addSomeETH(connext.address);
    await erc20Dest.mint(connext.address, ethers.utils.parseEther("100"));

    const UnlockManager = await ethers.getContractFactory("UnlockManager");

    // source chain
    managerSrc = await UnlockManager.deploy(connext.address);

    // destination chain
    managerDest = await UnlockManager.deploy(connext.address);

    // source chain
    ({ unlockEthers: unlockSrc } = await deployContracts());
    await unlockSrc.configUnlock(
      ADDRESS_ZERO, // udt
      wethSrc.address, // wrappedEth
      gasEstimate,
      "SRC_KEY",
      url,
      srcChainId
    );

    // destination chain
    ({ unlockEthers: unlockDest } = await deployContracts());
    await unlockDest.configUnlock(
      ADDRESS_ZERO, // udt
      wethDest.address, // wrappedEth
      gasEstimate,
      "DEST_KEY",
      url,
      destChainId
    );

    const args = [
      [unlockSrc.address, unlockDest.address],
      [srcChainId, destChainId],
      [srcDomainId, destDomainId],
    ];

    console.log(args)

    // setup managers
    await managerSrc.setUnlockAddresses(...args);
    await managerDest.setUnlockAddresses(...args);
  });

  describe("bridgeAddress", () => {
    it("stores bridger sender", async () => {
      assert.equal(connext.address, await managerDest.bridgeAddress());
      assert.equal(connext.address, await managerDest.bridgeAddress());
    });
  });

  describe("unlockAddresses", () => {
    it("set the unlock address properly", async () => {
      assert.equal(
        await managerSrc.unlockAddresses(destChainId),
        unlockDest.address
      );
      assert.equal(
        await managerDest.unlockAddresses(destChainId),
        unlockDest.address
      );
      assert.equal(
        await managerSrc.unlockAddresses(srcChainId),
        unlockSrc.address
      );
      assert.equal(
        await managerDest.unlockAddresses(srcChainId),
        unlockSrc.address
      );
    });

    it("set the domains and chainIds properly", async () => {
      assert.equal(await managerSrc.domains(destChainId), destDomainId);
      assert.equal(await managerSrc.chainIds(destDomainId), destChainId);
      assert.equal(await managerDest.domains(srcChainId), srcDomainId);
      assert.equal(await managerDest.chainIds(srcDomainId), srcChainId);
    });

    it("only unlock owner can call", async () => {
      reverts(
        managerSrc
          .connect(keyOwner)
          .setUnlockAddresses(destChainId, destDomainId, unlockDest.address),
        "ONLY_OWNER"
      );
    });
  });

  describe("setUnlockManager", () => {
    it("default to zero", async () => {
      assert.equal(await unlockSrc.unlockManager(), ADDRESS_ZERO);
    })
    it("sets unlock manager address correctly", async () => {
      await unlockSrc.setUnlockManager(managerSrc.address)
      assert.equal(await unlockSrc.unlockManager(), managerSrc.address);

      await unlockDest.setUnlockManager(managerDest.address)
      assert.equal(await unlockDest.unlockManager(), managerDest.address);
    });
    it("only unlock owner can call", async () => {
      reverts(
        unlockSrc
          .connect(keyOwner)
          .setUnlockManager(managerDest.address),
        "ONLY_OWNER"
      );
    });
  });

  describe("unlockManager", () => {
    let calldata
    const slippage = 30
    it('can change Unlock settings from the bridge', async () => {
      const PublicLock = await ethers.getContractFactory('TestPublicLockUpgraded')
      const template = await PublicLock.deploy()
      const args = [
        template.address,
        14
      ]

      const { interface } = unlockDest
      calldata = interface.encodeFunctionData('addLockTemplate', args)

      assert.equal(await unlockDest.publicLockImpls(args[1]), ADDRESS_ZERO);
      assert.equal(await unlockDest.publicLockVersions(args[0]), 0);

      // send call to the manager through the bridge
      await connext.xcall(
        destDomainId, // domainID
        managerDest.address,
        ADDRESS_ZERO, // currency
        ADDRESS_ZERO,
        0, // amount
        slippage,
        calldata
      )

      // make sure things have worked correctly
      assert.equal(await unlockDest.publicLockVersions(args[0]), args[1]);
      assert.equal(await unlockDest.publicLockImpls(args[1]), args[0]);
    })

    it('can upgrade Unlock from the bridge', async () => {
      const UnlockUpgraded = await ethers.getContractFactory('TestUnlockUpgraded')
      const unlockUpgraded = await UnlockUpgraded.deploy()

      const interface = new ethers.utils.Interface(proxyAdminAbi)
      const args = [unlockDest.address, unlockUpgraded.address]
      calldata = interface.encodeFunctionData('upgrade', args)

      // send call to the manager through the bridge
      await connext.xcall(
        destDomainId, // domainID
        managerDest.address,
        ADDRESS_ZERO, // currency
        ADDRESS_ZERO,
        0, // amount
        slippage,
        calldata
      )

    })
  })

});
