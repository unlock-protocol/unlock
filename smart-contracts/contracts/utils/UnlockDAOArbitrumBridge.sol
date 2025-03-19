import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IUniswapV3Router} from "@uniswap/v3-periphery/contracts/interfaces/IUniswapV3Router.sol";

interface IArbSys {
  /**
   * @notice Send given amount of Eth to dest from sender.
   * This is a convenience function, which is equivalent to calling sendTxToL1 with empty data.
   * @param destination recipient address on L1
   * @return unique identifier for this L2-to-L1 transaction.
   */
  function withdrawEth(address destination) external payable returns (uint256);

  /**
   * @notice creates a send txn from L2 to L1
   * @param position = (level << 192) + leaf = (0 << 192) + leaf = leaf
   */
  event L2ToL1Tx(
    address caller,
    address indexed destination,
    uint256 indexed hash,
    uint256 indexed position,
    uint256 arbBlockNum,
    uint256 ethBlockNum,
    uint256 timestamp,
    uint256 callvalue,
    bytes data
  );

  /// @dev DEPRECATED in favour of the new L2ToL1Tx event above after the nitro upgrade
  event L2ToL1Transaction(
    address caller,
    address indexed destination,
    uint256 indexed uniqueId,
    uint256 indexed batchNumber,
    uint256 indexInBatch,
    uint256 arbBlockNum,
    uint256 ethBlockNum,
    uint256 timestamp,
    uint256 callvalue,
    bytes data
  );

  /**
   * @notice logs a merkle branch for proof synthesis
   * @param reserved an index meant only to align the 4th index with L2ToL1Transaction's 4th event
   * @param hash the merkle hash
   * @param position = (level << 192) + leaf
   */
  event SendMerkleUpdate(
    uint256 indexed reserved,
    bytes32 indexed hash,
    uint256 indexed position
  );

  error InvalidBlockNumber(uint256 requested, uint256 current);
}

interface IL2GatewayRouter {
  function calculateL2TokenAddress(
    address l1ERC20
  ) external view returns (address);

  function outboundTransfer(
    address _l1Token,
    address _to,
    uint256 _amount,
    bytes calldata _data
  ) external payable returns (bytes memory);
}

contract UnlockDAOArbitrumBridge {
  // arb pre-compiles
  IArbSys public immutable ARB_SYS =
    IArbSys(0x0000000000000000000000000000000000000064);

  IL2GatewayRouter public immutable ROUTER;
  IUniswapV3Router public immutable UNISWAP_V3_ROUTER;
  address public immutable L1_UDT;
  address public immutable L1_TIMELOCK;
  address public immutable L2_TIMELOCK_ALIAS_ARB;
  address public immutable L2_ARB_TOKEN;
  address public immutable L2_WETH;

  /**
   * params will be stored as immutable values in the bytecode
   * @param routerGateway the ARB router gateway contract
   */
  constructor(
    address routerGateway,
    address l1Udt,
    address uniswapV3Router,
    address l2Arb,
    address l1Timelock,
    address l2TimelockAlias,
    address l2Weth
  ) {
    ROUTER = IL2GatewayRouter(routerGateway);
    L1_UDT = l1Udt;
    L1_TIMELOCK = l1Timelock;
    L2_TIMELOCK_ALIAS_ARB = l2TimelockAlias;
    UNISWAP_V3_ROUTER = IUniswapV3Router(uniswapV3Router);
    L2_WETH = l2Weth;
    L2_ARB_TOKEN = l2Arb;
  }

  /**
   * @notice Swaps ARB tokens for ETH and bridges both ETH and UDT tokens from L2 (Arbitrum) back to L1 (Mainnet)
   * This function:
   * 1. Swaps ARB tokens to WETH using Uniswap V3
   * 2. Unwraps WETH to ETH
   * 3. Withdraws all ETH balance to the L1 timelock
   * @param amountOutMinimum The minimum amount of WETH to receive from the ARB swap
   * @dev Can only be called by the L2 timelock alias address
   */
  function swapAndBridgeArb(uint amountOutMinimum) external payable {
    // send tokens to universal router to manipulate the token
    SafeERC20.safeTransfer(
      IERC20(tokenAddress),
      UNISWAP_UNIVERSAL_ROUTER,
      tokenAmount
    );

    // swap arb tokens to WETH
    uint arbBalance = IERC20(L2_ARB_TOKEN).balanceOf(L2_TIMELOCK_ALIAS_ARB);

    // encode parameters for the swap om UniversalRouter
    bytes memory path = abi.encodePacked(L2_ARB_TOKEN, fee, L2_WETH);
    bytes memory commands = abi.encodePacked(bytes1(uint8(V3_SWAP_EXACT_IN)));
    bytes[] memory inputs = new bytes[](1);
    inputs[0] = abi.encode(
      address(this), // recipient is this contract
      tokenAmount, // amountIn
      amountOutMinimum, // amountOutMinimum
      path,
      false // funds are coming from universal router
    );

    // unwrap WETH
    address weth = IUnlock(L2_TIMELOCK_ALIAS_ARB).weth();
    address wethBalance = IERC20(weth).balanceOf(address(this));
    IWETH(WETH).withdraw(wethBalance);

    // send native tokens to L1
    uint nativeBalance = address(this).balance;
    ARB_SYS.withdrawEth{value: nativeBalance}(L1_TIMELOCK);
  }

  /**
   * @notice Bridges UDT tokens from L2 (Arbitrum) back to L1 (Mainnet)
   * @dev Can only be called by the L2 timelock alias address
   */
  function bridgeUdt() external {
    // send udt to l1
    address l2token = ROUTER.calculateL2TokenAddress(L1_UDT);
    uint udtBalance = IERC20(l2token).balanceOf(L2_TIMELOCK_ALIAS_ARB);
    ROUTER.outboundTransfer(L1_UDT, L1_TIMELOCK, udtBalance, "");
  }
}
