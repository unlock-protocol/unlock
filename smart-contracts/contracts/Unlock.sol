pragma solidity 0.5.9;

/**
 * @title The Unlock contract
 * @author Julien Genestoux (unlock-protocol.com)
 * This smart contract has 3 main roles:
 *  1. Distribute discounts to discount token holders
 *  2. Grant dicount tokens to users making referrals and/or publishers granting discounts.
 *  3. Create & deploy Public Lock contracts.
 * In order to achieve these 3 elements, it keeps track of several things such as
 *  a. Deployed locks addresses and balances of discount tokens granted by each lock.
 *  b. The total network product (sum of all key sales, net of discounts)
 *  c. Total of discounts granted
 *  d. Balances of discount tokens, including 'frozen' tokens (which have been used to claim
 * discounts and cannot be used/transfered for a given period)
 *  e. Growth rate of Network Product
 *  f. Growth rate of Discount tokens supply
 * The smart contract has an owner who only can perform the following
 *  - Upgrades
 *  - Change in golden rules (20% of GDP available in discounts, and supply growth rate is at most
 * 50% of GNP growth rate)
 * NOTE: This smart contract is partially implemented for now until enough Locks are deployed and
 * in the wild.
 * The partial implementation includes the following features:
 *  a. Keeping track of deployed locks
 *  b. Keeping track of GNP
 */

import 'openzeppelin-eth/contracts/ownership/Ownable.sol';
import 'zos-lib/contracts/Initializable.sol';
import './PublicLock.sol';
import './interfaces/IUnlock.sol';
import './mixins/MixinNoFallback.sol';


/// @dev Must list the direct base contracts in the order from “most base-like” to “most derived”.
/// https://solidity.readthedocs.io/en/latest/contracts.html#multiple-inheritance-and-linearization
contract Unlock is
  IUnlock,
  MixinNoFallback,
  Initializable,
  Ownable
{
  /**
   * The struct for a lock
   * We use deployed to keep track of deployments.
   * This is required because both totalSales and yieldedDiscountTokens are 0 when initialized,
   * which would be the same values when the lock is not set.
   */
  struct LockBalances {
    bool deployed;
    uint totalSales; // This is in wei
    uint yieldedDiscountTokens;
  }

  modifier onlyFromDeployedLock() {
    require(locks[msg.sender].deployed, 'ONLY_LOCKS');
    _;
  }

  uint public grossNetworkProduct;

  uint public totalDiscountGranted;

  // We keep track of deployed locks to ensure that callers are all deployed locks.
  mapping (address => LockBalances) public locks;

  // global base token URI
  // Used by locks where the owner has not set a custom base URI.
  string private globalBaseTokenURI;

   // global base token symbol
  // Used by locks where the owner has not set a custom symbol
  string private globalTokenSymbol;

  // Events
  event NewLock(
    address indexed lockOwner,
    address indexed newLockAddress
  );

  event NewTokenURI(
    string tokenURI
  );

  event NewGlobalTokenSymbol(
    string tokenSymbol
  );

  // Use initialize instead of a constructor to support proxies (for upgradeability via zos).
  function initialize(
    address _owner
  )
    public
    initializer()
  {
    // We must manually initialize Ownable.sol
    Ownable.initialize(_owner);
  }

  /**
  * @dev Create lock
  * This deploys a lock for a creator. It also keeps track of the deployed lock.
  * @param _tokenAddress set to the ERC20 token address, or 0 for ETH.
  */
  function createLock(
    uint _expirationDuration,
    address _tokenAddress,
    uint _keyPrice,
    uint _maxNumberOfKeys,
    string memory _lockName
  ) public
  {
    // create lock
    address newLock = address(
      new PublicLock(
        msg.sender,
        _expirationDuration,
        _tokenAddress,
        _keyPrice,
        _maxNumberOfKeys,
        _lockName
      )
    );

    // Assign the new Lock
    locks[newLock] = LockBalances({
      deployed: true,
      totalSales: 0,
      yieldedDiscountTokens: 0
    });

    // trigger event
    emit NewLock(msg.sender, newLock);
  }

  /**
   * This function returns the discount available for a user, when purchasing a
   * a key from a lock.
   * This does not modify the state. It returns both the discount and the number of tokens
   * consumed to grant that discount.
   * TODO: actually implement this.
   */
  function computeAvailableDiscountFor(
    address _purchaser, // solhint-disable-line no-unused-vars
    uint _keyPrice // solhint-disable-line no-unused-vars
  )
    public
    view
    returns (uint discount, uint tokens)
  {
    // TODO: implement me
    return (0, 0);
  }

  /**
   * This function keeps track of the added GDP, as well as grants of discount tokens
   * to the referrer, if applicable.
   * The number of discount tokens granted is based on the value of the referal,
   * the current growth rate and the lock's discount token distribution rate
   * This function is invoked by a previously deployed lock only.
   * TODO: actually implement
   */
  function recordKeyPurchase(
    uint _value,
    address _referrer // solhint-disable-line no-unused-vars
  )
    public
    onlyFromDeployedLock()
  {
    // TODO: implement me (discount tokens)
    grossNetworkProduct += _value;
    locks[msg.sender].totalSales += _value;
  }

  /**
   * This function will keep track of consumed discounts by a given user.
   * It will also grant discount tokens to the creator who is granting the discount based on the
   * amount of discount and compensation rate.
   * This function is invoked by a previously deployed lock only.
   */
  function recordConsumedDiscount(
    uint _discount,
    uint _tokens // solhint-disable-line no-unused-vars
  )
    public
    onlyFromDeployedLock()
  {
    // TODO: implement me
    totalDiscountGranted += _discount;
    return;
  }

  // The version number of the current Unlock implementation on this network
  function unlockVersion(
  ) external pure
    returns (uint16)
  {
    return 4;
  }

  // function to read the globalTokenURI field.
  function getGlobalBaseTokenURI()
    external
    view
    returns (string memory)
  {
    return globalBaseTokenURI;
  }


  // function to set the globalTokenURI field.
  function setGlobalBaseTokenURI(
    string calldata _URI
  )
    external
    onlyOwner
  {
    globalBaseTokenURI = _URI;
    emit NewTokenURI(_URI);
  }

  // function to read the globalTokenSymbol field.
  function getGlobalTokenSymbol()
    external
    view
    returns (string memory)
  {
    return globalTokenSymbol;
  }

  // function to set the globalTokenSymbol field.
  function setGlobalTokenSymbol(
    string calldata _symbol
  )
    external
    onlyOwner
  {
    globalTokenSymbol = _symbol;
    emit NewGlobalTokenSymbol(_symbol);
  }
}