'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('CREATE DOMAIN pg_chain_id AS BIGINT;')
    return Promise.all([
      // Can't change as it is a primary key
      // queryInterface.changeColumn('Blocks', 'chain', {
      //   type: 'pg_chain_id',
      // }),
      queryInterface.changeColumn('Transactions', 'chain', {
        type: 'pg_chain_id',
      }),
      queryInterface.changeColumn('Locks', 'chain', {
        type: 'pg_chain_id',
      }),
      queryInterface.changeColumn('AuthorizedLocks', 'chain', {
        type: 'pg_chain_id',
      }),
      queryInterface.changeColumn('KeyMetadata', 'chain', {
        type: 'pg_chain_id',
      }),
      queryInterface.changeColumn('LockMetadata', 'chain', {
        type: 'pg_chain_id',
      }),
      queryInterface.changeColumn('UserTokenMetadata', 'chain', {
        type: 'pg_chain_id',
      }),
      queryInterface.changeColumn('StripeConnectLocks', 'chain', {
        type: 'pg_chain_id',
      }),
      queryInterface.changeColumn('Charges', 'chain', {
        type: 'pg_chain_id',
      }),
      queryInterface.changeColumn('LockIcons', 'chain', {
        type: 'pg_chain_id',
      }),
      queryInterface.changeColumn('LockMigrations', 'chain', {
        type: 'pg_chain_id',
      }),
      queryInterface.changeColumn('LockMigrations', 'chain', {
        type: 'pg_chain_id',
      }),
      queryInterface.changeColumn('ProcessedHookItems', 'network', {
        type: 'pg_chain_id',
      }),
      queryInterface.changeColumn('PaymentIntents', 'chain', {
        type: 'pg_chain_id',
      }),
      queryInterface.changeColumn('KeyRenewals', 'network', {
        type: 'pg_chain_id',
      }),
      queryInterface.changeColumn('Verifiers', 'network', {
        type: 'pg_chain_id',
      }),
      queryInterface.changeColumn('KeySubscriptions', 'network', {
        type: 'pg_chain_id',
      }),
      queryInterface.changeColumn('ReceiptBases', 'network', {
        type: 'pg_chain_id',
      }),
      queryInterface.changeColumn('Receipt', 'network', {
        type: 'pg_chain_id',
      }),
      queryInterface.changeColumn('CustomEmailContents', 'network', {
        type: 'pg_chain_id',
      }),
      queryInterface.changeColumn('LockSettings', 'network', {
        type: 'pg_chain_id',
      })
    ])
  },

  async down(queryInterface, Sequelize) {
    await Promise.all([
      // Can't change as it is a primary key
      // queryInterface.changeColumn('Blocks', 'chain', {
      //   type: Sequelize.INTEGER,
      // }),
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
    return queryInterface.sequelize.query('DROP DOMAIN pg_chain_id;')
  }
};
