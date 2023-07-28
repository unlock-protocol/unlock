'use strict'

const table = 'Transactions'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex(table, { fields: ['transactionHash'] })
    await queryInterface.addIndex(table, { fields: ['sender', 'createdAt'] })
    await queryInterface.addIndex(table, { fields: ['recipient', 'createdAt'] })
    await queryInterface.addIndex(table, {
      fields: ['transactionHash', 'createdAt'],
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex(table, 'transactions_transaction_hash')
    await queryInterface.removeIndex(table, 'transactions_sender_created_at')
    await queryInterface.removeIndex(table, 'transactions_recipient_created_at')
    await queryInterface.removeIndex(
      table,
      'transactions_transaction_hash_created_at'
    )
  },
}
