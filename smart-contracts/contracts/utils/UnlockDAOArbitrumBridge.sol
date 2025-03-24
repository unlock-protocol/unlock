import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IUniversalRouter} from "../interfaces/IUniversalRouter.sol";
import {IWETH} from "../interfaces/IWETH.sol";

interface IQuoterV2 {
  function quoteExactInputSingle(
    address tokenIn,
    address tokenOut,
    uint24 fee,
    uint256 amountIn,
    uint160 sqrtPriceLimitX96
  )
    external
    returns (
      uint256 amountOut,
      uint160 sqrtPriceX96After,
      uint32 initializedTicksCrossed,
      uint256 gasEstimate
    );
}

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
  function outboundTransfer(
    address _l1Token,
    address _to,
    uint256 _amount,
    bytes calldata _data
  ) external payable returns (bytes memory);

  function calculateL2TokenAddress(
    address l1Token
  ) external view returns (address);
}

contract UnlockDAOArbitrumBridge {
  // arb pre-compiles
  IArbSys public immutable ARB_SYS =
    IArbSys(0x0000000000000000000000000000000000000064);

  IQuoterV2 public immutable QUOTER_V2;
  IUniversalRouter public immutable UNISWAP_UNIVERSAL_ROUTER;
  IL2GatewayRouter public immutable GATEWAY_ROUTER;
  IWETH public immutable L2_WETH;
  IERC20 public immutable L2_ARB_TOKEN;
  address public immutable L1_UDT;
  address public immutable L1_TIMELOCK;

  constructor(address l1Timelock) {
    UNISWAP_UNIVERSAL_ROUTER = IUniversalRouter(
      0x4C60051384bd2d3C01bfc845Cf5F4b44bcbE9de5
    ); // Arb UniversalRouter
    GATEWAY_ROUTER = IL2GatewayRouter(
      0x5288c571Fd7aD117beA99bF60FE0846C4E84F933
    ); // Arb Gateway Router
    QUOTER_V2 = IQuoterV2(0x61fFE014bA17989E743c5F6cB21bF9697530B21e); // Arbitrum Quoter V2
    L2_WETH = IWETH(0x82aF49447D8a07e3bd95BD0d56f35241523fBab1); // Arb WETH
    L2_ARB_TOKEN = IERC20(0x912CE59144191C1204E64559FE8253a0e49E6548); // ARB token on Arb
    L1_UDT = 0x90DE74265a416e1393A450752175AED98fe11517; // UDT token on Mainnet
    L1_TIMELOCK = l1Timelock; //0x17EEDFb0a6E6e06E95B3A1F928dc4024240BC76B;
  }

  /**
   * @notice Swaps ARB tokens for ETH and bridges both ETH and UDT tokens from L2 (Arbitrum) back to L1 (Mainnet)
   */
  function swapAndBridgeArb() external {
    // swap arb tokens to WETH
    uint arbBalance = IERC20(L2_ARB_TOKEN).balanceOf(address(this));

    // send tokens to universal router to manipulate the token
    IERC20(L2_ARB_TOKEN).transfer(
      address(UNISWAP_UNIVERSAL_ROUTER),
      arbBalance
    );

    // Get quote for ARB -> WETH swap
    (uint256 amountOut, , , ) = QUOTER_V2.quoteExactInputSingle(
      address(L2_ARB_TOKEN),
      address(L2_WETH),
      uint24(3000), // 0.3% fee tier
      arbBalance,
      0 // no price limit
    );

    // Apply 2% slippage tolerance
    uint amountOutMinimum = (amountOut * 98) / 100;

    // encode the V3 swap command
    bytes memory commands = new bytes(1);
    commands[0] = bytes1(uint8(0x00)); // V3_SWAP_EXACT_IN command

    // encode the parameters for the swap
    bytes[] memory inputs = new bytes[](1);
    inputs[0] = abi.encode(
      address(this), // recipient
      arbBalance, // amount in
      amountOutMinimum, // amount out minimum
      abi.encodePacked(
        address(L2_ARB_TOKEN), // token in
        uint24(3000), // fee tier (0.3%)
        address(L2_WETH) // token out (WETH)
      ),
      false // use stored tokens in router
    );

    // execute the swap via Universal Router
    UNISWAP_UNIVERSAL_ROUTER.execute(commands, inputs);

    // unwrap WETH
    uint wethBalance = L2_WETH.balanceOf(address(this));
    L2_WETH.withdraw(wethBalance);

    // send native tokens to L1
    uint nativeBalance = address(this).balance;
    ARB_SYS.withdrawEth{value: nativeBalance}(L1_TIMELOCK);
  }

  /**
   * @notice Bridges UDT tokens from L2 (Arbitrum) back to L1 (Mainnet) using the Arbitrum Gateway Router
   * @dev Can only be called by the L2 timelock alias address
   */
  function bridgeUdt() external {
    // Get L2 UDT token address and balance
    address l2UdtToken = GATEWAY_ROUTER.calculateL2TokenAddress(L1_UDT);
    uint udtBalance = IERC20(l2UdtToken).balanceOf(address(this));

    // Bridge UDT tokens back to L1 using the gateway router
    GATEWAY_ROUTER.outboundTransfer(
      L1_UDT,
      L1_TIMELOCK,
      udtBalance,
      "" // no extra data needed
    );
  }

  /**
   * @dev This function is required to handle ETH received from unwrapping WETH during swaps
   */
  receive() external payable {}
}
