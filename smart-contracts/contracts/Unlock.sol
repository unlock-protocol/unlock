pragma solidity 0.5.12;

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

import '@openzeppelin/contracts-ethereum-package/contracts/ownership/Ownable.sol';
import '@openzeppelin/upgrades/contracts/Initializable.sol';
import './PublicLock.sol';
import './interfaces/IUnlock.sol';
import './interfaces/IUniswap.sol';
import './mixins/CloneFactory.sol';


/// @dev Must list the direct base contracts in the order from “most base-like” to “most derived”.
/// https://solidity.readthedocs.io/en/latest/contracts.html#multiple-inheritance-and-linearization
contract Unlock is
  IUnlock,
  Initializable,
  Ownable,
  CloneFactory
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
  string public globalBaseTokenURI;

  // global base token symbol
  // Used by locks where the owner has not set a custom symbol
  string public globalTokenSymbol;

  // The address of the public lock template, used when `createLock` is called
  address public publicLockAddress;

  // Map token address to exchange contract address if the token is supported
  // Used for GDP calculations
  mapping (address => IUniswap) public uniswapExchanges;

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
    require(publicLockAddress != address(0), 'MISSING_LOCK_TEMPLATE');

    // create lock
    address newLock = createClone(publicLockAddress);
    PublicLock(newLock).initialize(
      msg.sender,
      _expirationDuration,
      _tokenAddress,
      _keyPrice,
      _maxNumberOfKeys,
      _lockName
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
    if(_value > 0) {
      uint valueInETH;
      address tokenAddress = PublicLock(msg.sender).tokenAddress();
      if(tokenAddress != address(0)) {
        // If priced in an ERC-20 token, find the supported uniswap exchange
        IUniswap exchange = uniswapExchanges[tokenAddress];
        if(address(exchange) != address(0)) {
          valueInETH = exchange.getTokenToEthInputPrice(_value);
        } else {
          // If the token type is not supported, assume 0 value
          valueInETH = 0;
        }
      }
      else {
        // If priced in ETH (or value is 0), no conversion is required
        valueInETH = _value;
      }

      grossNetworkProduct += valueInETH;
      locks[msg.sender].totalSales += valueInETH;
    }
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
    return 5;
  }

  // function for the owner to update configuration variables
  function configUnlock(
    address _publicLockAddress,
    string calldata _symbol,
    string calldata _URI
  ) external
    onlyOwner
  {
    publicLockAddress = _publicLockAddress;
    globalTokenSymbol = _symbol;
    globalBaseTokenURI = _URI;

    emit ConfigUnlock(_publicLockAddress, _symbol, _URI);
  }

  // allows the owner to set the exchange address to use for value conversions
  // setting the _exchangeAddress to address(0) removes support for the token
  function setExchange(
    address _tokenAddress,
    address _exchangeAddress
  ) external
    onlyOwner
  {
    uniswapExchanges[_tokenAddress] = IUniswap(_exchangeAddress);
  }
}
