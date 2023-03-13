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
const srcChainId = 31337;
const destChainId = 4;
const srcDomainId = 1735353714;
const destDomainId = 1734439522;

const gasEstimate = 16000;
const url = `http://locksmith:8080/api/key/`;

contract("Unlock / bridge", () => {
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
});
