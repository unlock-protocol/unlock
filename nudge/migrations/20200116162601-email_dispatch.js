'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'EmailDispatch',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        lockAddress: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        keyId: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        emailAddress: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {
        uniqueKeys: {
          email_dispatch_unique: {
            fields: ['lockAddress', 'keyId', 'emailAddress'],
          },
        },
      }
    )
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('EmailDispatch')
  },
}
