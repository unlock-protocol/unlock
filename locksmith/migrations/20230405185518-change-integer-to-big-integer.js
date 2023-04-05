'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn('Transactions', 'chain', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('Locks', 'chain', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('AuthorizedLocks', 'chain', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('KeyMetadata', 'chain', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('LockMetadata', 'chain', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('UserTokenMetadata', 'chain', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('StripeConnectLocks', 'chain', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('Charges', 'chain', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('LockIcons', 'chain', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('LockMigrations', 'chain', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('LockMigrations', 'chain', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('ProcessedHookItems', 'network', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('PaymentIntents', 'chain', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('KeyRenewals', 'network', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('Verifiers', 'network', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('KeySubscriptions', 'network', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('ReceiptBases', 'network', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('Receipt', 'network', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('CustomEmailContents', 'network', {
        type: Sequelize.BIGINT,
      }),
      queryInterface.changeColumn('LockSettings', 'network', {
        type: Sequelize.BIGINT,
      })
    ])
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn('Transactions', 'chain', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn('Locks', 'chain', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn('AuthorizedLocks', 'chain', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn('KeyMetadata', 'chain', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn('LockMetadata', 'chain', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn('UserTokenMetadata', 'chain', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn('StripeConnectLocks', 'chain', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn('Charges', 'chain', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn('LockIcons', 'chain', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn('LockMigrations', 'chain', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn('LockMigrations', 'chain', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn('ProcessedHookItems', 'network', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn('PaymentIntents', 'chain', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn('KeyRenewals', 'network', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn('Verifiers', 'network', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn('KeySubscriptions', 'network', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn('ReceiptBases', 'network', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn('Receipt', 'network', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn('CustomEmailContents', 'network', {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn('LockSettings', 'network', {
        type: Sequelize.INTEGER,
      })
    ])
  }
};
