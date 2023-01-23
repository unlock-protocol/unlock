// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import {IXReceiver} from "@connext/nxtp-contracts/contracts/core/connext/interfaces/IXReceiver.sol";
import {IConnext} from "@connext/nxtp-contracts/contracts/core/connext/interfaces/IConnext.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IWETH.sol";

contract UnlockCrossChainPurchaser is Ownable {

  // The connext contract on the origin domain
  address public bridgeAddress;

  // in BPS, in this case 0.3%
  uint constant MAX_SLIPPAGE = 30;

  // The WETH token address
  address public weth;

  // the chain id => address of Unlock receiver on the destination chain
  mapping (uint => address) public crossChainPurchasers;

  // the mapping 
  mapping(uint => uint32) public domains; 
  mapping(uint32 => uint) public chainIds; 

  // Errors
  error OnlyBridge();
  error ChainNotSet();
  error InsufficientApproval(uint requiredAmount);
  error InsufficientBalance();

  event BridgeCallReceived(
    uint originChainId,
    address indexed lockAddress, 
    bytes32 transferID
  );

  event BridgeCallEmitted(
    uint destChainId,
    address indexed unlockAddress, 
    address indexed lockAddress, 
    bytes32 transferID
  );

  constructor(
    address _bridgeAddress, address _weth
  ) {
    bridgeAddress = _bridgeAddress;
    weth = _weth;
  }


  // make sure receiver contract exists on dest chain
  function _chainIsSet(uint _chainId) internal view {
    if(domains[_chainId] == 0 || crossChainPurchasers[_chainId] == address(0)) {
      revert ChainNotSet();
    }
  }

  /**
   * Allow to set bridge address
   * @param _bridgeAddress the address of the bridge
   */
  function setBridgeAddress(address _bridgeAddress) public onlyOwner {
    bridgeAddress = _bridgeAddress;
  }

  /**
   * @param _chainIds IDs of the chains where crossPurchasers are deployed
   * @param _domains Domain IDs used by the Connext Bridge https://docs.connext.network/resources/supported-chains
   * @param _crossChainPurchasers address of the purchaser contracts on the chains
   * @notice the 3 arrays should have the same length
   */
  function setCrossChainPurchasers(
    uint[] calldata _chainIds, 
    uint32[] calldata _domains,
    address[] calldata _crossChainPurchasers
  ) public onlyOwner {
    require(
      _chainIds.length == _domains.length 
      && 
      _chainIds.length == _crossChainPurchasers.length,
      'l'
    );
    for (uint i = 0; i < _chainIds.length; i++) {
      domains[_chainIds[i]] = _domains[i];
      chainIds[_domains[i]] = _chainIds[i];
      crossChainPurchasers[_chainIds[i]] = _crossChainPurchasers[i];
    }
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
  function sendBridgedLockCall(
    uint destChainId, 
    address lock, 
    address currency, 
    uint amount, 
    bytes calldata callData,
    uint relayerFee,
    uint slippage
  ) public payable returns (bytes32 transferID){
    
    // make sure receiver contract exists on dest chain
    _chainIsSet(destChainId);

    if(currency != address(0)) {
      // TODO: send using transfer (no approval)
      if(IERC20(currency).allowance(msg.sender, address(this)) < amount) {
        revert InsufficientApproval(amount);
      }

      // User sends funds to this contract
      IERC20(currency).transferFrom(msg.sender, address(this), amount);

      // This contract approves transfer to Connext
      IERC20(currency).approve(bridgeAddress, amount);
    } 

    // make sure we have enough balance
    // NB: using a ternary to avoid variable and Stack Too Deep error
    if((currency == address(0) ? amount + relayerFee : relayerFee) > address(this).balance) {
      revert InsufficientBalance();
    }

    bytes memory cd = abi.encode(lock, callData); 

    // send the call over the chain
    transferID = IConnext(bridgeAddress).xcall{value: currency == address(0) ? amount + relayerFee : relayerFee}(
      domains[destChainId],    // _destination: Domain ID of the destination chain
      crossChainPurchasers[destChainId], // _to: address of the target contract
      currency,           // _asset: address of the token contract
      msg.sender,           // _delegate: TODO address that can revert or forceLocal on destination
      amount,             // _amount: amount of tokens to transfer
      slippage,         // _slippage: the maximum amount of slippage the user will accept
      cd // pass the lock address in calldata
    );

    emit BridgeCallEmitted(
      destChainId,
      crossChainPurchasers[destChainId],
      lock, 
      transferID
    );
  }

  // TODO: cancel and refund the bridged call
  // function refundBridgedCall(uint32 transferId) {
  // 1. make sure transferId is failed
  // 2. refund
  // }


    
  /** 
   * @notice The receiver function as required by the IXReceiver interface.
   * @dev The Connext bridge contract will call this function.
   */
  function xReceive(
    bytes32 transferId,
    uint256 amount,
    address currency,
    address originSender, // address of the contract on the origin chain
    uint32 origin, // 	Domain ID of the origin chain
    bytes memory callData
  ) external returns (bytes memory) {

    // only connext can call this function
    if(msg.sender != bridgeAddress) {
      revert OnlyBridge();
    }

    // 0 if is erc20
    uint valueToSend;

    // unpack lock address and calldata
    address payable lockAddress;
    bytes memory lockCalldata;
    (lockAddress, lockCalldata) = abi.decode(callData, (address, bytes));
    
    if (currency != address(0)) {
      IERC20 token = IERC20(currency);
      // make sure we got enough tokens from the bridge
      require(token.balanceOf(address(this)) >= amount, "INSUFFICIENT_BALANCE");
      // approve the lock to get the tokens 
      token.approve(lockAddress, amount);
    } else {
      // unwrap native tokens
      valueToSend = amount;
      require(
        valueToSend <= IWETH(weth).balanceOf(address(this)),
        "INSUFFICIENT_BALANCE"
      );
      IWETH(weth).withdraw(valueToSend);
      require(valueToSend <= address(this).balance, "INSUFFICIENT_BALANCE");
    }

    (bool success, ) = lockAddress.call{value: valueToSend}(lockCalldata);
    // catch revert reason
    if (success == false) {
      assembly {
        let ptr := mload(0x40)
        let size := returndatasize()
        returndatacopy(ptr, 0, size)
        revert(ptr, size)
      }
    }

    emit BridgeCallReceived(
      chainIds[origin],
      lockAddress, 
      transferId
    );
  }

  // required as WETH withdraw will unwrap and send tokens here
  receive() external payable {}

}