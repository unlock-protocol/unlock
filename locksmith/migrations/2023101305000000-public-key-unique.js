'use strict'

const table = 'UserReferences'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn(table, 'publicKey', {
      type: Sequelize.STRING,
      unique: true,
    })
    await queryInterface.removeConstraint(
      table,
      'UserReferences_publicKey_fkey'
    )
    await queryInterface.addIndex(table, { fields: ['publicKey'] })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn(table, 'publicKey', {
      type: Sequelize.STRING,
    })
    await queryInterface.removeIndex(table, 'user_references_public_key')
    await queryInterface.addConstraint(table, {
      type: 'foreign key',
      fields: ['publicKey'],
      name: 'UserReferences_publicKey_fkey',
      references: {
        table: 'Users',
        field: 'publicKey',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })
  },
}
