import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

interface ILockProxy is ITransparentUpgradeableProxy {}

contract LockProxy is TransparentUpgradeableProxy {
  constructor(
    address _impl,
    address _admin,
    bytes memory _data
  ) TransparentUpgradeableProxy(_impl, _admin, _data) {}
}
