interface IUnlockBridgeSender {
  /**
   * @notice Purchase a key on another chain
   * Purchase a key from a lock on another chain
   * @param destChainId: the chain id on which the lock is located
   * @param lock: address of the lock that the user is attempting to purchase a key from
   * @param currency : address of the token to be swapped into the lock’s currency
   * @param amount: the *maximum a*mount of `currency` the user is willing to spend in order to complete purchase. (The user needs to have ERC20 approved the Unlock contract for *at least* that amount).
   * @param callData: blob of data passed to the lock that includes the following:
   * @param relayerFee The fee offered to connext relayers. On testnet, this can be 0.
   * @return transferId id returned by connext.xcall 
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
  ) external payable returns (bytes32 transferId);

}