const HARDHAT_VM_ERROR = 'VM Exception while processing transaction:'

module.exports = {
  errorMessages: {
    HARDHAT_VM_ERROR,
    VM_ERROR_INVALID_OPCODE: `${HARDHAT_VM_ERROR} invalid opcode`,
    VM_ERROR_REVERT_WITH_REASON: `${HARDHAT_VM_ERROR} reverted with reason string`,
    VM_ERROR_REVERT_UNKNOWN:
      "Transaction reverted and Hardhat couldn't infer the reason. Please report this to help us improve Hardhat.",
  },
  LATEST_UNLOCK_VERSION: 11,
  LATEST_PUBLIC_LOCK_VERSION: 11,
  ADDRESS_ZERO: '0x0000000000000000000000000000000000000000',
  MAX_UINT:
    '115792089237316195423570985008687907853269984665640564039457584007913129639935',
  MAX_GAS: 6700000,
}
