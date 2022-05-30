// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title List of all error messages 
 * (replace string errors message to save on contract size)
 */
contract MixinErrors {

    struct UnlockErrors {
      // generic
      string OUT_OF_RANGE;
      string NULL_VALUE;
      string INVALID_ADDRESS;
      string INVALID_TOKEN;
      
      // erc 721
      string NON_COMPLIANT_ERC721_RECEIVER;

      // roles
      string ONLY_LOCK_MANAGER_OR_KEY_GRANTER;
      string ONLY_KEY_MANAGER_OR_APPROVED;
      string UNAUTHORIZED_KEY_MANAGER_UPDATE;
      string ONLY_LOCK_MANAGER_OR_BENEFICIARY;
      string ONLY_LOCK_MANAGER;

      // single key status
      string KEY_NOT_VALID;
      string NO_SUCH_KEY;

      // migration & data schema
      string SCHEMA_VERSION_NOT_CORRECT;
      string MIGRATION_REQUIRED;

      // lock status/settings
      string OWNER_CANT_BE_ADDRESS_ZERO;
      string MAX_KEYS;
      string NON_EXPIRING_LOCK;
      string NON_ERC20_LOCK;
      string KEY_TRANSFERS_DISABLED;

      // transfers and approvals
      string TRANSFER_FROM_NOT_KEY_OWNER;
      string TRANSFER_TO_SELF;
      string CANNOT_APPROVE_SELF;
      string APPROVE_SELF;

      // 
      string OWNER_INDEX_OUT_OF_BOUNDS;
      string CANT_EXTEND_NON_EXPIRING_KEY;
      string NOT_ENOUGH_TIME;
      string SMALLER_THAN_SUPPLY;
      string NOT_ENOUGH_FUNDS;

      // keys management 
      string LOCK_SOLD_OUT;
      string INVALID_REFERRERS_LENGTH;
      string INVALID_KEY_MANAGERS_LENGTH;
      
      // purchase
      string INSUFFICIENT_ERC20_VALUE;
      string INSUFFICIENT_VALUE;

      // renewals
      string PRICE_CHANGED;
      string DURATION_CHANGED;
      string TOKEN_CHANGED;
      string NOT_READY;

      // gas refund
      string GAS_REFUND_FAILED;

      // hooks
      string INVALID_ON_KEY_SOLD_HOOK;
      string INVALID_ON_KEY_CANCEL_HOOK;
      string INVALID_ON_VALID_KEY_HOOK;
      string INVALID_ON_TOKEN_URI_HOOK;

    }

    UnlockErrors internal errors;

    function _initializeMixinErrors() internal {
      errors = UnlockErrors({
        OUT_OF_RANGE : '0',
        NULL_VALUE : '1',
        INVALID_ADDRESS : '2',
        INVALID_TOKEN : '3',

        // erc 721
        NON_COMPLIANT_ERC721_RECEIVER : '4',

        // roles
        ONLY_LOCK_MANAGER_OR_KEY_GRANTER : '5',
        ONLY_KEY_MANAGER_OR_APPROVED : '6',
        UNAUTHORIZED_KEY_MANAGER_UPDATE : '7',
        ONLY_LOCK_MANAGER_OR_BENEFICIARY : '8',
        ONLY_LOCK_MANAGER : '9',

        // single key status
        KEY_NOT_VALID : '10',
        NO_SUCH_KEY : '11',

        // migration & data schema
        SCHEMA_VERSION_NOT_CORRECT : '12',
        MIGRATION_REQUIRED : '13',

        // lock status/settings
        OWNER_CANT_BE_ADDRESS_ZERO : '14',
        MAX_KEYS : '15',
        NON_EXPIRING_LOCK : '16',
        NON_ERC20_LOCK : '17',
        KEY_TRANSFERS_DISABLED : '18',

        // transfers and approvals
        TRANSFER_FROM_NOT_KEY_OWNER : '19',
        TRANSFER_TO_SELF : '20',
        CANNOT_APPROVE_SELF : '21',
        APPROVE_SELF : '22',

        // 
        OWNER_INDEX_OUT_OF_BOUNDS : '23',
        CANT_EXTEND_NON_EXPIRING_KEY : '24 ',
        NOT_ENOUGH_TIME : '25',
        SMALLER_THAN_SUPPLY : '26 ',
        NOT_ENOUGH_FUNDS : '27',

        // keys management 
        LOCK_SOLD_OUT : '28',
        INVALID_REFERRERS_LENGTH : '29',
        INVALID_KEY_MANAGERS_LENGTH : '30 ',

        // purchase
        INSUFFICIENT_ERC20_VALUE : '31',
        INSUFFICIENT_VALUE : '32',

        // renewals
        PRICE_CHANGED : '33',
        DURATION_CHANGED : '34',
        TOKEN_CHANGED : '35',
        NOT_READY : '36',

        // gas refund
        GAS_REFUND_FAILED : '37',

        // hooks
        INVALID_ON_KEY_SOLD_HOOK : '38',
        INVALID_ON_KEY_CANCEL_HOOK : '39',
        INVALID_ON_VALID_KEY_HOOK : '40',
        INVALID_ON_TOKEN_URI_HOOK : '41'
      
      });
    }

}
