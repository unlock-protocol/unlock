import {IL2GatewayRouter} from "../interfaces/arb/IArbL2GatewayRouter.sol";
import {IArbSys} from "../interfaces/arb/IArbSys.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UnlockDAOArbitrumBridge {
  // arb pre-compiles
  IArbSys public immutable ARB_SYS =
    IArbSys(0x0000000000000000000000000000000000000064);

  IL2GatewayRouter public immutable ROUTER;

  address public immutable L1_UDT;
  address public immutable L1_TIMELOCK;
  address public immutable L2_TIMELOCK_ALIAS_ARB;

  /**
   * params will be stored as immutable values in the bytecode
   * @param routerGateway the ARB router gateway contract
   */
  constructor(
    address routerGateway,
    address l1Udt,
    address l1Timelock,
    address l2TimelockAlias
  ) {
    ROUTER = IL2GatewayRouter(routerGateway);
    L1_UDT = l1Udt;
    L1_TIMELOCK = l1Timelock;
    L2_TIMELOCK_ALIAS_ARB = l2TimelockAlias;
  }

  /**
   * @notice Bridges both native tokens (ETH) and UDT tokens from L2 (Arbitrum) back to L1 (Mainnet)
   * This function:
   * 1. Withdraws all ETH balance to the L1 timelock
   * 2. Transfers all UDT tokens to L1 timelock
   * @dev Can only be called by the L2 timelock alias address
   */
  function bridge() external payable override {
    // send native tokens to L1
    uint nativeBalance = L1_TIMELOCK.balance;
    ARB_SYS.withdrawEth{value: nativeBalance}(L1_TIMELOCK);

    // send udt to l1
    address l2token = ROUTER.calculateL2TokenAddress(L1_UDT);
    uint udtBalance = IERC20(l2token).balanceOf(L2_TIMELOCK_ALIAS_ARB);
    ROUTER.outboundTransfer(L1_UDT, L1_TIMELOCK, udtBalance, "");
  }
}
