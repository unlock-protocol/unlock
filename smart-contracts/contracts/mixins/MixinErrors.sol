// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title List of all error messages 
 * (replace string errors message to save on contract size)
 */
contract MixinErrors {
  
  // generic
  error OUT_OF_RANGE();
  error NULL_VALUE();
  error INVALID_ADDRESS();
  error INVALID_TOKEN();
  error UNAUTHORIZED();

  // erc 721
  error NON_COMPLIANT_ERC721_RECEIVER();

  // roles
  error ONLY_LOCK_MANAGER_OR_KEY_GRANTER();
  error ONLY_KEY_MANAGER_OR_APPROVED();
  error UNAUTHORIZED_KEY_MANAGER_UPDATE();
  error ONLY_LOCK_MANAGER_OR_BENEFICIARY();
  error ONLY_LOCK_MANAGER();

    // single key status
  error KEY_NOT_VALID();
  error NO_SUCH_KEY();

    // migration & data schema
  error SCHEMA_VERSION_NOT_CORRECT();
  error MIGRATION_REQUIRED();

    // lock status/settings
  error OWNER_CANT_BE_ADDRESS_ZERO();
  error MAX_KEYS();
  error KEY_TRANSFERS_DISABLED();

  // transfers and approvals
  error TRANSFER_TO_SELF();
  error CANNOT_APPROVE_SELF();

  // 
  error OWNER_INDEX_OUT_OF_BOUNDS();
  error CANT_EXTEND_NON_EXPIRING_KEY();
  error NOT_ENOUGH_TIME();
  error SMALLER_THAN_SUPPLY();
  error NOT_ENOUGH_FUNDS();

  // keys management 
  error LOCK_SOLD_OUT();
  error INVALID_LENGTH();

  // purchase
  error INSUFFICIENT_ERC20_VALUE();
  error INSUFFICIENT_VALUE();

  // renewals
  error NON_RENEWABLE_LOCK();
  error LOCK_HAS_CHANGED();
  error NOT_READY();

    // gas refund
  error GAS_REFUND_FAILED();

    // hooks
  error INVALID_HOOK();

  }
