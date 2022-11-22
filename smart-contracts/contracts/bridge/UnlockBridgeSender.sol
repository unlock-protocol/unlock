pragma solidity ^0.8.15;

import {IConnext} from "@connext/nxtp-contracts/contracts/core/connext/interfaces/IConnext.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract UnlockBridgeSender is Ownable {

  // main Unlock contract
  address public unlockAddress;

  // The connext contract on the origin domain
  address public connextAddress;

  // in BPS, in this case 0.3%
  uint constant MAX_SLIPPAGE = 30;

  // the chain id => address of bridge receiver on the destination chain
  mapping (uint => address) public receiverAddresses;

  modifier onlyUnlock() {
    require(
      msg.sender == unlockAddress,
      "Source contract can only be called by Unlock"
    );
    _;
  }

  // In the constructor we pass information that the modifier will check
  constructor(
    address _unlockAddress,
    address _connextAddress
  ) {
    unlockAddress = _unlockAddress;
    connextAddress = _connextAddress;
  }

  function setConnext(address _connextAddress) public onlyOwner {
    connextAddress = _connextAddress;
  }
  
  function setUnlockAddress(address _unlockAddress) public onlyOwner {
    unlockAddress = _unlockAddress;
  }
  function setReceiverAddresses(uint _chainId, address _receiverAddress) public onlyOwner {
    receiverAddresses[_chainId] = _receiverAddress;
  }

  function getDomain(uint chainId) public returns (uint32 domain){
    // parse domain
    return domain;
  }

  /**
   * @notice Purchase a key on another chain
   * Purchase a key from a lock on another chain
   * @param destChainId: the chain id on which the lock is located
   * @param lock: address of the lock that the user is attempting to purchase a key from
   * @param currency : address of the token to be swapped into the lock’s currency
   * @param amount: the *maximum a*mount of `currency` the user is willing to spend in order to complete purchase. (The user needs to have ERC20 approved the Unlock contract for *at least* that amount).
   * @param callData: blob of data passed to the lock that includes the following:
   * @param relayerFee The fee offered to connext relayers. On testnet, this can be 0.
   * @dev to construct the callData you need the following parameter
      - `recipients`: address of the recipients of the membership
      - `referrers`: address of the referrers
      - `keyManagers`: address of the key managers
      - `callData`: bytes passed to the purchase function function of the lock
   */
  function callLock(
    uint destChainId, 
    address lock, 
    address currency, 
    uint amount, 
    bytes calldata callData, 
    uint relayerFee
  ) public payable onlyUnlock() returns (bytes32 transferID) {

    console.log('---- arrived in bridge sender');
    console.log(destChainId);
    console.log(lock);
    console.log(currency);
    console.log(amount);
    console.logBytes(callData);
    console.log(relayerFee);

    // get the correct receiver contract on dest chain
    console.log(destChainId);
    address receiverAddress = receiverAddresses[destChainId];
    console.log(receiverAddress);
    require(receiverAddress != address(0), 'missing receiverAddress on dest chain');

    // TODO: ERC20 should be sent using transfer (no approval)
    if (currency != address(0)) {
      IERC20 token = IERC20(currency);
      require(
        token.allowance(msg.sender, address(this)) >= amount,
        "User must approve amount"
      );

      // User sends funds to this contract
      token.transferFrom(msg.sender, address(this), amount);

      // This contract approves transfer to Connext
      token.approve(connextAddress, amount);
    }

    // get the domain
    uint32 destinationDomain = getDomain(destChainId);
    console.logBytes(callData);

    // pass the lock address in calldata
    bytes memory data = abi.encode(
      lock,
      callData
    );            
    console.logBytes(data);
    
    // send the call over the chain
    transferID = IConnext(connextAddress).xcall(
      destinationDomain,    // _destination: Domain ID of the destination chain
      receiverAddress,      // _to: address of the target contract
      currency,           // _asset: address of the token contract
      msg.sender,           // _delegate: address that can revert or forceLocal on destination
      amount,             // _amount: amount of tokens to transfer
      MAX_SLIPPAGE,        // _slippage: the maximum amount of slippage the user will accept
      data
    );

    console.logBytes32(transferID);
    console.log(uint(transferID));

  }
}
